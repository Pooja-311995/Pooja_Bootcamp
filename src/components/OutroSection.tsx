import React, { useState } from 'react';
import { OutroSection as OutroSectionType } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmailModal from './EmailModal';

interface OutroSectionProps {
  outroData: OutroSectionType | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

const OutroSection: React.FC<OutroSectionProps> = ({
  outroData,
  loading = false,
  error = null,
  className = "outro outro_home"
}) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outroData?.contact_details?.email) {
      setIsEmailModalOpen(true);
    } else {
      // Fallback to track order page if no email available
      window.location.href = '/track-order';
    }
  };
  if (loading) {
    return (
      <section className={`page__outro ${className}`}>
        <div className="outro__container">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`page__outro ${className}`}>
        <div className="outro__container">
          <ErrorMessage message={error} />
        </div>
      </section>
    );
  }

  if (!outroData) {
    return null;
  }

  const formatLocationAddress = () => {
    const { location_details } = outroData;
    if (!location_details) return null;

    const parts = [
      location_details.address,
      location_details.city,
      location_details.state,
      location_details.postal_code,
      location_details.country
    ].filter(Boolean);

    return parts.join(', ');
  };

  const formatWorkingHours = () => {
    const { working_hours } = outroData;
    if (!working_hours) return null;

    if (working_hours.general_hours) {
      return working_hours.general_hours;
    }

    const days = [
      { key: 'monday', label: 'Mon' },
      { key: 'tuesday', label: 'Tue' },
      { key: 'wednesday', label: 'Wed' },
      { key: 'thursday', label: 'Thu' },
      { key: 'friday', label: 'Fri' },
      { key: 'saturday', label: 'Sat' },
      { key: 'sunday', label: 'Sun' }
    ];

    const hoursEntries = days
      .map(day => ({
        day: day.label,
        hours: working_hours[day.key as keyof typeof working_hours]
      }))
      .filter(entry => entry.hours);

    if (hoursEntries.length === 0) return null;

    return hoursEntries.map(entry => `${entry.day}: ${entry.hours}`).join(' | ');
  };

  const backgroundStyle = outroData.background_image?.url 
    ? { backgroundImage: `url(${outroData.background_image.url})` }
    : {};

  return (
    <section className={`page__outro ${className}`} style={backgroundStyle}>
      <div className="outro__container">
        <h2 className="outro__title title">
          {outroData.title || "Visit GRABO Today"}
        </h2>
        
        <div className="outro__text">
          {outroData.description || "Ready to experience the perfect cup of coffee? Visit us today and discover why GRABO is the preferred choice for coffee lovers."}
        </div>

        <div className="outro__details">
          {/* Location Details */}
          {(formatLocationAddress() || outroData.location_details) && (
            <div className="outro__detail-item">
              <h3 className="outro__detail-title">📍 Location</h3>
              <p className="outro__detail-text">
                {formatLocationAddress() || 'Location information available'}
              </p>
            </div>
          )}

          {/* Contact Details */}
          {outroData.contact_details && (
            <div className="outro__detail-item">
              <h3 className="outro__detail-title">📞 Contact</h3>
              <div className="outro__contact-info">
                {outroData.contact_details.phone && (
                  <p className="outro__detail-text">
                    <strong>Phone:</strong> 
                    <a href={`tel:${outroData.contact_details.phone.replace(/\s/g, '')}`} className="outro__contact-link">
                      {outroData.contact_details.phone}
                    </a>
                  </p>
                )}
                {outroData.contact_details.email && (
                  <p className="outro__detail-text">
                    <strong>Email:</strong> 
                    <a href={`mailto:${outroData.contact_details.email}`} className="outro__contact-link">
                      {outroData.contact_details.email}
                    </a>
                  </p>
                )}
                {outroData.contact_details.website && (
                  <p className="outro__detail-text">
                    <strong>Website:</strong> 
                    <a href={outroData.contact_details.website} target="_blank" rel="noopener noreferrer" className="outro__contact-link">
                      {outroData.contact_details.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Working Hours */}
          {(formatWorkingHours() || outroData.working_hours) && (
            <div className="outro__detail-item">
              <h3 className="outro__detail-title">🕒 Working Hours</h3>
              <p className="outro__detail-text">
                {formatWorkingHours() || 'Working hours available'}
              </p>
            </div>
          )}
        </div>

        {outroData.call_to_action && (
          <button 
            onClick={handleContactClick}
            className="outro__button button button-coffee"
          >
            {outroData.call_to_action.title}
          </button>
        )}

        {/* Email Modal */}
        {outroData?.contact_details?.email && (
          <EmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            recipientEmail={outroData.contact_details.email}
          />
        )}
      </div>
    </section>
  );
};

export default OutroSection;
