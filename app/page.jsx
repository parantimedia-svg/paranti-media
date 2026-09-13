"use client";

import { useRef } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import PauseOffscreen from "@/components/PauseOffscreen";
import Cursor from "@/components/Cursor";
import Birds from "@/components/Birds";
import Atmosphere from "@/components/Atmosphere";
import DirectorMode from "@/components/DirectorMode";
import Intro from "@/components/Intro";
import ScrollRail from "@/components/ScrollRail";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import Services from "@/components/Services";
import Work from "@/components/Work";
import BuildAShot from "@/components/BuildAShot";
import About from "@/components/About";
import Why from "@/components/Why";
import Trust from "@/components/Trust";
import Process from "@/components/Process";
import Industries from "@/components/Industries";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useReveal } from "@/lib/motion";

export default function Page() {
  const mainRef = useRef(null);
  useReveal(mainRef);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <SmoothScroll />
      {/* Pauses ambient CSS animation in sections that are off screen. */}
      <PauseOffscreen />
      <Intro />
      <Cursor />
      <ScrollRail />
      {/* Sky layer. Sits at z-index -1, behind every section. */}
      <Birds />
      {/* The cinematic atmosphere: dust and moving shadow behind the content,
          the travelling Paranti Light and lens effects over it. */}
      <Atmosphere />
      <div className="grain" aria-hidden="true" />
      {/* Renders nothing until the hero's viewfinder is pressed. */}
      <DirectorMode />

      <Nav />

      <main id="main" ref={mainRef}>
        <Hero />
        <Showreel />
        <Services />
        <Work />
        {/* You have seen the work; now build a frame of your own. */}
        <BuildAShot />
        <About />
        <Why />
        <Trust />
        <Process />
        <Industries />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
