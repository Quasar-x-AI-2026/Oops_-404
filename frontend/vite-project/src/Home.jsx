import React from "react";
import Orb from "./Design/Orb.jsx";
import GradientText from "./Design/GradientText.jsx";
import StaggeredMenu from "./Design/StaggeredMenu.jsx";
import HeroSection from "./Component/HeroSection.jsx";

const Home = () => {
  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "Third Eye", ariaLabel: "Enter Face Cursor Interface", link: "/face-cursor" },
    { label: "About", ariaLabel: "Learn about us", link: "/about" },
    { label: "Contact", ariaLabel: "Get in touch", link: "/contact" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        backgroundColor: "#050505",
        overflowX: "hidden",
        overflowY: "auto",
        fontFamily: "'Roboto Condensed', sans-serif"
      }}
    >
      {/* 1. Background Orb (Fixed) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          filter: "saturate(1.5) hue-rotate(180deg)"
        }}
      >
        <Orb
          hoverIntensity={2}
          rotateOnHover
          hue={190}
          forceHoverState={false}
          backgroundColor="transparent"
        />
      </div>

      {/* 2. Navigation Menu (Fixed Top-Right) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 9999, // Ensure it's above everything
          width: "100%",
          pointerEvents: "none" // Let clicks pass through except on the button
        }}
      >
          <StaggeredMenu
            position="right"
            items={menuItems}
            socialItems={socialItems}
            displaySocials
            displayItemNumbering={true}
            menuButtonColor="#ffffff"
            openMenuButtonColor="#fff"
            changeMenuColorOnOpen={true}
            colors={['#B19EEF', '#5227FF']}
            //logoUrl="/path-to-your-logo.svg"
            accentColor="#5227FF"
            onMenuOpen={() => console.log('Menu opened')}
            onMenuClose={() => console.log('Menu closed')}
          />

      </div>

      {/* 3. Main Content */}
      {/* Hero Section */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          position: "relative", // Added to ensure zIndex works relative to parent
          zIndex: 10, // Added to bring content above orb
          width: "100%" // Added to ensure it takes full width
        }}
      >
        <GradientText
          colors={["#06b6d4", "#ffffff", "#22d3ee"]}
          animationSpeed={6}
          showBorder={false}
          className="roboto-condensed font-bold tracking-widest uppercase"
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            lineHeight: 1,
            textAlign: "center"
          }}
        >
          Third Eye
        </GradientText>

        <div
          className="roboto-condensed"
          style={{
            color: "#22d3ee",
            marginTop: "1.5rem",
            fontSize: "clamp(1rem, 2vw, 1.5rem)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.9,
            textAlign: "center",
            maxWidth: "80%",
            textShadow: "0 0 10px rgba(6,182,212,0.5)"
          }}
        >
          AI-Powered Vision Interface
        </div>
      </div>

      {/* Content Below Hero */}
      <div className="w-full text-white pb-24"
        style={{
          position: "relative", // Added to ensure zIndex works relative to parent
          zIndex: 10, // Added to bring content above orb
          display: "flex", // Added for consistent layout
          flexDirection: "column", // Added for consistent layout
          alignItems: "center" // Added for consistent layout
        }}
      >
        <HeroSection />
      </div>
    </div>
  );
};

export default Home;
