import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-6DJ284363Z'; // From old config

export const initAnalytics = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
