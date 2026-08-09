
import React from 'react';
import './KeyFeatures.css';
import image1 from '../images/image1.png';
import image2 from '../images/image2.png';
import image3 from '../images/image3.png';

function KeyFeatures() {
  return (
    <section className="key-features">
      <h2>Our Key Features</h2>
      <p>Discover the powerful features that make our drowsiness detection system stand out.</p>
      <div className="features">
        <div className="feature">
          <img src={image1} alt="Advanced Sensor Technology" />
          <h3>Advanced Sensor Technology</h3>
          <p>Utilizes sensors to accurately monitor driver behavior and detect signs of drowsiness.</p>
        </div>
        <div className="feature">
          <img src={image2} alt="Real-time Alerts" />
          <h3>Real-time Alerts</h3>
          <p>Instantly notifies drivers and relevant authorities when drowsiness is detected, preventing potential accidents.</p>
        </div>
        <div className="feature">
          <img src={image3} alt="User-friendly Interface" />
          <h3>User-friendly Interface</h3>
          <p>Intuitive interface designed for ease of use, ensuring seamless integration with existing vehicle systems.</p>
        </div>
      </div>
    </section>
  );
}

export default KeyFeatures;
