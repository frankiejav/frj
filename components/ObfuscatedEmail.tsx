"use client";

import { useEffect, useState } from "react";

export function ObfuscatedEmail() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(["contact", "frjgarcia.com"].join("@"));
  }, []);

  if (!email) {
    return <span aria-hidden="true">&nbsp;</span>;
  }

  return <a href={`mailto:${email}`}>{email}</a>;
}
