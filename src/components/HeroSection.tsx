import React from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundVideo?: string;
  backgroundImage?: string;
  isMainHero?: boolean;
  isCompact?: boolean;
  backgroundFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  backgroundPosition?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink = "#",
  backgroundVideo,
  backgroundImage,
  isMainHero = false,
  isCompact = false,
  backgroundFit = 'cover',
  backgroundPosition = 'center'
}) => {
  const sectionStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: backgroundFit,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: 'no-repeat'
      } as React.CSSProperties
    : undefined;
  return (
    <section 
      className={`page__main main ${!isMainHero ? 'main_pages' : ''} ${isCompact ? 'main_compact' : ''}`} 
      style={sectionStyle}
    >
      {backgroundVideo && (
        <video className="main__video" autoPlay muted loop>
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {(backgroundVideo || backgroundImage) && (
        <div className="main__overlay" aria-hidden="true" />
      )}
      <div className={`main__container ${!isMainHero ? 'main__container_pages' : ''} ${isCompact ? 'main__container_compact' : ''}`}>
        {subtitle && <h3 className="main__caption">{subtitle}</h3>}
        <h1 className="main__title">{title}</h1>
        {description && (
          <div className={`main__text ${!isMainHero ? 'main__text_pages' : ''}`}>
            {description}
          </div>
        )}
        {buttonText && (
          <a href={buttonLink} className="main__button">
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
