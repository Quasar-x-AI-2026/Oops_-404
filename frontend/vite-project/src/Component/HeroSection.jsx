import React from 'react'
import TextType from '../Design/TypeText/TextType'

const HeroSection = () => {
  return (
    <div style={{ fontSize: '2rem', color: 'white' }}> {/* Ensure visible size/color */}
      <TextType 
        text={["Welcome to Third Eye", "Build some amazing experiences!", "Happy coding!"]}
        typingSpeed={75}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="_"
        deletingSpeed={50}
        loop={true}
      />
    </div>
  )
}

export default HeroSection