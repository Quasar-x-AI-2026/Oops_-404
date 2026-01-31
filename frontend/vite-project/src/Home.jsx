import React from 'react'
import Orb from './Design/Orb'
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
    
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Orb hue={190} />

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
    </div>
  )
}


export default Home
