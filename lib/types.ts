export type WizardFormData = {
  school: {
    name: string;
    shortName: string;
    acronym: string;
    mascot: string;
    appName: string;
    city: string;
    state: string;
    stateCode: string;
    country: string;
    academicYear: string;
  };
  colors: {
    primary: string;
    accent: string;
  };
  schedule: {
    dayTypes: {
      id: string;
      label: string;
      weekdays: number[];
    }[];
    bells: Record<string, {
      shared: { name: string; start: string; end: string }[];
      lunchWaves?: Record<string, { name: string; start: string; end: string }[]>;
      after: { name: string; start: string; end: string }[];
    }>;
  };
  lunchWaves: {
    enabled: boolean;
    options: { id: string; label: string }[];
    default: string;
  };
  calendar: {
    noSchoolDates: { date: string; name: string }[];
    earlyDismissalDates: { date: string; name: string }[];
    events: { date: string; name: string; type: string; endDate?: string }[];
  };
  features: {
    events: boolean;
    productivity: boolean;
  };
  contactEmail: string;
};
