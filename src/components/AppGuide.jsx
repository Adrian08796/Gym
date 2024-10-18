// src/components/AppGuide.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './AppGuide.css';

function getImageSource(baseName, lang) {
  const imgSrc = `/images/${baseName}-${lang}.png`;
  const img = new Image();
  img.src = imgSrc;
  
  return new Promise((resolve) => {
    img.onload = () => resolve(imgSrc);
    img.onerror = () => resolve(`/images/${baseName}-en.png`); // Fallback to English
  });
}

function AppGuide() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState(0);
  const [imageSources, setImageSources] = useState({});

  const currentLang = i18n.language;

  useEffect(() => {
    async function loadImages() {
      const sources = {
        workoutPlans: await getImageSource('workout-plans', currentLang),
        exerciseLibrary: await getImageSource('exercise-library', currentLang),
        workoutTracker: await getImageSource('workout-tracker', currentLang),
        progressDashboard: await getImageSource('progress-dashboard', currentLang),
      };
      setImageSources(sources);
    }
    loadImages();
  }, [currentLang]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const sections = [
    {
      title: t("Getting Started"),
      content: (
        <>
          <p className="mb-4">{t("Level Up is your personal fitness companion. Here's how to get started:")}</p>
          <ol className="list-decimal list-inside">
            <li className="mb-2">{t("Create a workout plan or choose from our default plans")}</li>
            <li className="mb-2">{t("Add exercises to your plan from our extensive library")}</li>
            <li className="mb-2">{t("Start your workout and track your progress")}</li>
            <li className="mb-2">{t("View your workout history and see your improvements")}</li>
          </ol>
        </>
      )
    },
    {
      title: t("Key Features"),
      content: (
        <Slider {...carouselSettings} className="key-features-carousel">
          <div className="carousel-slide">
            <h3 className="text-xl font-medium mb-2">{t("Workout Plans")}</h3>
            <p>{t("Create custom workout plans or use our pre-made ones.")}</p>
            <img src={imageSources.workoutPlans} alt={t("Workout Plans Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
          <div className="carousel-slide">
            <h3 className="text-xl font-medium mb-2">{t("Exercise Library")}</h3>
            <p>{t("Browse our extensive library of exercises with detailed instructions.")}</p>
            <img src={imageSources.exerciseLibrary} alt={t("Exercise Library Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
          <div className="carousel-slide">
            <h3 className="text-xl font-medium mb-2">{t("Workout Tracker")}</h3>
            <p>{t("Track your workouts in real-time and log your progress.")}</p>
            <img src={imageSources.workoutTracker} alt={t("Workout Tracker Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
          <div className="carousel-slide">
            <h3 className="text-xl font-medium mb-2">{t("Progress Dashboard")}</h3>
            <p>{t("View your workout history and track your improvements over time.")}</p>
            <img src={imageSources.progressDashboard} alt={t("Progress Dashboard Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
        </Slider>
      )
    },
    {
      title: t("Tips for Success"),
      content: (
        <ul className="list-disc list-inside">
          <li className="mb-2">{t("Consistency is key - try to stick to your workout schedule")}</li>
          <li className="mb-2">{t("Track your progress regularly to stay motivated")}</li>
          <li className="mb-2">{t("Don't hesitate to modify exercises or plans to suit your needs")}</li>
          <li className="mb-2">{t("Stay hydrated and maintain a balanced diet for best results")}</li>
        </ul>
      )
    }
  ];

  return (
    <div className="app-guide">
      <div className="app-guide-nav">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setActiveSection(index)}
            className={`app-guide-nav-button ${activeSection === index ? 'active' : ''}`}
          >
            {section.title}
          </button>
        ))}
      </div>
      <div className="app-guide-content">
        <h2 className="app-guide-content-title">{sections[activeSection].title}</h2>
        <div className="app-guide-section-content">
          {sections[activeSection].content}
        </div>
      </div>
    </div>
  );
}

export default AppGuide;