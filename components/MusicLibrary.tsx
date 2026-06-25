"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Playlist, PlaylistTrack } from "@/lib/playlists";
import styles from "./MusicLibrary.module.css";

type ActiveTrack = { playlistIndex: number; trackIndex: number };

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTotalDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function coverHue(artist: string): number {
  let hash = 0;
  for (let i = 0; i < artist.length; i++) {
    hash = artist.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function AlbumCover({ track, size }: { track: PlaylistTrack; size: "sm" | "lg" | "hero" | "card" }) {
  const className =
    size === "card"
      ? styles.coverCard
      : size === "hero"
        ? styles.coverHero
        : size === "lg"
          ? styles.coverLg
          : styles.coverSm;

  if (track.albumArt) {
    return (
      <img
        src={track.albumArt}
        alt=""
        className={className}
        width={size === "card" ? 200 : size === "hero" ? 88 : size === "lg" ? 72 : 44}
        height={size === "card" ? 200 : size === "hero" ? 88 : size === "lg" ? 72 : 44}
        loading="lazy"
      />
    );
  }

  const hue = coverHue(track.artist);
  const initial = track.artist.charAt(0).toUpperCase();
  return (
    <div
      className={`${className} ${styles.coverFallback}`}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 38% 52%), hsl(${(hue + 36) % 360} 42% 32%))`,
      }}
      aria-hidden="true"
    >
      <span>{initial}</span>
    </div>
  );
}

function playlistCover(tracks: PlaylistTrack[]): PlaylistTrack {
  return tracks.find((t) => t.albumArt) ?? tracks[0];
}

export function MusicLibrary({ playlists }: { playlists: Playlist[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState<ActiveTrack>({ playlistIndex: 0, trackIndex: 0 });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const currentPlaylist = playlists[active.playlistIndex];
  const current = currentPlaylist.tracks[active.trackIndex];
  const isActive = (pi: number, ti: number) =>
    active.playlistIndex === pi && active.trackIndex === ti;

  const playTrack = useCallback((playlistIndex: number, trackIndex: number) => {
    setActive({ playlistIndex, trackIndex });
    setPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [playing]);

  const playNext = useCallback(() => {
    const { playlistIndex, trackIndex } = active;
    const tracks = playlists[playlistIndex].tracks;
    if (trackIndex < tracks.length - 1) {
      playTrack(playlistIndex, trackIndex + 1);
    } else if (playlistIndex < playlists.length - 1) {
      playTrack(playlistIndex + 1, 0);
    } else {
      setPlaying(false);
    }
  }, [active, playlists, playTrack]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const { playlistIndex, trackIndex } = active;
    if (trackIndex > 0) {
      playTrack(playlistIndex, trackIndex - 1);
    } else if (playlistIndex > 0) {
      const prev = playlists[playlistIndex - 1];
      playTrack(playlistIndex - 1, prev.tracks.length - 1);
    }
  }, [active, playlists, playTrack]);

  const hasNext = useCallback(() => {
    const { playlistIndex, trackIndex } = active;
    const tracks = playlists[playlistIndex].tracks;
    return trackIndex < tracks.length - 1 || playlistIndex < playlists.length - 1;
  }, [active, playlists]);

  useEffect(() => {
    setProgress(0);
    setDuration(0);
  }, [active.playlistIndex, active.trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;
    void audio.play().catch(() => setPlaying(false));
  }, [active, playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (!seeking) setProgress(audio.currentTime);
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => playNext();

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [playNext, seeking]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    setProgress(value);
    audio.currentTime = value;
  };

  const maxDuration = duration || current.duration;

  return (
    <div className={styles.library}>
      <audio ref={audioRef} src={current.src} preload="metadata" />

      {playlists.map((playlist, playlistIndex) => {
        const totalDuration = playlist.tracks.reduce((sum, t) => sum + t.duration, 0);
        const hero = playlistCover(playlist.tracks);

        return (
          <section key={playlist.meta.id} className={styles.playlist}>
            <header className={styles.playlistHeader}>
              <AlbumCover track={hero} size="hero" />
              <div className={styles.playlistMeta}>
                <h2 className={styles.playlistName}>{playlist.meta.name}</h2>
                <p className={styles.playlistStats}>
                  {playlist.tracks.length} tracks · {formatTotalDuration(totalDuration)}
                </p>
              </div>
            </header>

            <ul className={styles.trackGrid}>
              {playlist.tracks.map((track, trackIndex) => (
                <li key={track.id}>
                  <button
                    type="button"
                    className={styles.trackCard}
                    data-active={isActive(playlistIndex, trackIndex)}
                    data-playing={isActive(playlistIndex, trackIndex) && playing}
                    onClick={() => playTrack(playlistIndex, trackIndex)}
                  >
                    <AlbumCover track={track} size="card" />
                    <span className={styles.trackInfo}>
                      <span className={styles.trackTitle}>{track.title}</span>
                      <span className={styles.trackArtist}>{track.artist}</span>
                      <span className={styles.trackDuration}>{formatTime(track.duration)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className={styles.nowPlaying}>
        <AlbumCover track={current} size="lg" />
        <div className={styles.nowMeta}>
          <p className={styles.nowPlaylist}>{currentPlaylist.meta.name}</p>
          <p className={styles.nowTitle}>{current.title}</p>
          <p className={styles.nowArtist}>
            {current.artist}
            {current.album && <span className={styles.nowAlbum}> · {current.album}</span>}
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.transport}>
            <button type="button" className={styles.btn} onClick={playPrev} aria-label="Previous track">
              {"\u23EE"}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPlay}`}
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "\u23F8" : "\u25B6"}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={playNext}
              aria-label="Next track"
              disabled={!hasNext()}
            >
              {"\u23ED"}
            </button>
          </div>

          <div className={styles.scrubber}>
            <span className={styles.time}>{formatTime(progress)}</span>
            <input
              type="range"
              className={styles.seek}
              min={0}
              max={maxDuration || 0}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              onPointerDown={() => setSeeking(true)}
              onPointerUp={() => setSeeking(false)}
              aria-label="Seek"
            />
            <span className={styles.time}>{formatTime(maxDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
