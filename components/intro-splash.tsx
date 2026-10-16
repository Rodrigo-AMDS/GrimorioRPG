"use client";

import { useEffect, useState } from "react";

export function IntroSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("grimorio-intro-v3") === "seen") {
      setVisible(false);
      return;
    }
    const beginExit = window.setTimeout(() => setLeaving(true), 3100);
    const finish = window.setTimeout(() => {
      sessionStorage.setItem("grimorio-intro-v3", "seen");
      setVisible(false);
    }, 3650);
    return () => { window.clearTimeout(beginExit); window.clearTimeout(finish); };
  }, []);

  function skip() {
    sessionStorage.setItem("grimorio-intro-v3", "seen");
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 500);
  }

  if (!visible) return null;
  return <section className={`intro-splash ${leaving ? "intro-splash--leaving" : ""}`} aria-label="Abrindo O Grimório do Mestre">
    <div className="intro-noise" />
    <div className="intro-embers intro-embers--one" /><div className="intro-embers intro-embers--two" />
    <div className="intro-portal"><span /><span /><span /></div>
    <div className="dragon-crest" aria-hidden="true">
      <img className="dragon-illustration" src="/images/intro-dragon.png" alt="" />
    </div>
    <div className="intro-copy">
      <p className="intro-kicker">ARQUIVO DAS CAMPANHAS</p>
      <h1>O GRIMÓRIO<br /><em>DO MESTRE</em></h1>
      <div className="intro-rule"><i />✦<i /></div>
      <p className="intro-status">O dragão desperta os antigos selos</p>
      <div className="intro-loader"><span /></div>
    </div>
    <button className="intro-skip" type="button" onClick={skip}>Pular abertura</button>
  </section>;
}
