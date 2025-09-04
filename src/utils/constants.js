export const PERMANENT_LOGO_URL = "https://cdn.discordapp.com/attachments/1346110313401155679/1405155664216592384/viber_image_2025-07-30_15-19-42-577.png?ex=689dccb0&is=689c7b30&hm=16262b6f756db6a87987062564aad5a1127b34677704cfd9b72fb74c6e451797&";

export const TIME_SLOTS = [
  "Shift 1",
  "Shift 2", 
  "Shift 3",
  "Day Off",
];

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() + i - 2
);

export const INITIAL_PAYROLL_DATA = {
  "L2 OJT": [
    "Alcontin, Joshua M.",
    "Angcos, Mark Joseph E.",
    "Cayao, Leomyr D.",
    "Chua, Hillary Gabriel G.",
    "Diano, Hitler B.",
    "Dusaran, John Paul E.",
    "Escamilla, Jan Denise J.",
    "Fernandez, Joanalyn Y.",
    "Manrique, Jeanne Leigh F.",
    "Martinez, Mart Angelo G.",
    "Miranda, Jaylord M.",
  ],
  APPRENTICESHIP: ["Pecha, Bernadine", "Salimbot, Jomar"],
  "L1 CYBER CADETS": [
    "Baluaro, Bernard",
    "Daquila, Eric John",
    "Diaz, Relyn Ann",
    "Cunanan, Kim Gerard D.",
    "Uson, John Clifford B.",
  ],
};

// Weekly Schedule Template
export const WEEKLY_SCHEDULE_TEMPLATE = {
  "Sunday": {
    "Shift 1": ["Alcontin, Joshua M.", "Diano, Hitler B.", "Dusaran, John Paul E.", "Salimbot, Jomar", "Uson, John Clifford B."],
    "Shift 2": ["Miranda, Jaylord M.", "Fernandez, Joanalyn Y.", "Escamilla, Jan Denise J.", "Pecha, Bernadine"],
    "Shift 3": ["Angcos, Mark Joseph E.", "Daquila, Eric John"],
    "Day Off": ["Cunanan, Kim Gerard D.", "Cayao, Leomyr D.", "Baluaro, Bernard", "Martinez, Mart Angelo G.", "Chua, Hillary Gabriel G.", "Manrique, Jeanne Leigh F.", "Diaz, Relyn Ann"]
  },
  "Monday": {
    "Shift 1": ["Dusaran, John Paul E.", "Cayao, Leomyr D.", "Martinez, Mart Angelo G.", "Diano, Hitler B.", "Manrique, Jeanne Leigh F.", "Salimbot, Jomar"],
    "Shift 2": ["Alcontin, Joshua M.", "Fernandez, Joanalyn Y.", "Uson, John Clifford B.", "Escamilla, Jan Denise J.", "Cunanan, Kim Gerard D."],
    "Shift 3": ["Miranda, Jaylord M.", "Pecha, Bernadine"],
    "Day Off": ["Chua, Hillary Gabriel G.", "Angcos, Mark Joseph E.", "Baluaro, Bernard", "Daquila, Eric John", "Diaz, Relyn Ann"]
  },
  "Tuesday": {
    "Shift 1": ["Cayao, Leomyr D.", "Martinez, Mart Angelo G.", "Chua, Hillary Gabriel G.", "Manrique, Jeanne Leigh F.", "Diaz, Relyn Ann", "Baluaro, Bernard"],
    "Shift 2": ["Dusaran, John Paul E.", "Alcontin, Joshua M.", "Diano, Hitler B.", "Uson, John Clifford B.", "Salimbot, Jomar", "Cunanan, Kim Gerard D."],
    "Shift 3": ["Fernandez, Joanalyn Y.", "Escamilla, Jan Denise J."],
    "Day Off": ["Miranda, Jaylord M.", "Angcos, Mark Joseph E.", "Daquila, Eric John", "Pecha, Bernadine"]
  },
  "Wednesday": {
    "Shift 1": ["Chua, Hillary Gabriel G.", "Manrique, Jeanne Leigh F.", "Angcos, Mark Joseph E.", "Diaz, Relyn Ann", "Daquila, Eric John", "Baluaro, Bernard"],
    "Shift 2": ["Dusaran, John Paul E.", "Cayao, Leomyr D.", "Martinez, Mart Angelo G.", "Diano, Hitler B.", "Salimbot, Jomar"],
    "Shift 3": ["Alcontin, Joshua M.", "Cunanan, Kim Gerard D.", "Uson, John Clifford B."],
    "Day Off": ["Miranda, Jaylord M.", "Fernandez, Joanalyn Y.", "Escamilla, Jan Denise J.", "Pecha, Bernadine"]
  },
  "Thursday": {
    "Shift 1": ["Miranda, Jaylord M.", "Manrique, Jeanne Leigh F.", "Angcos, Mark Joseph E.", "Daquila, Eric John", "Pecha, Bernadine"],
    "Shift 2": ["Cayao, Leomyr D.", "Martinez, Mart Angelo G.", "Chua, Hillary Gabriel G.", "Diaz, Relyn Ann", "Baluaro, Bernard"],
    "Shift 3": ["Dusaran, John Paul E.", "Diano, Hitler B.", "Salimbot, Jomar"],
    "Day Off": ["Alcontin, Joshua M.", "Fernandez, Joanalyn Y.", "Escamilla, Jan Denise J.", "Cunanan, Kim Gerard D."]
  },
  "Friday": {
    "Shift 1": ["Miranda, Jaylord M.", "Manrique, Jeanne Leigh F.", "Fernandez, Joanalyn Y.", "Escamilla, Jan Denise J.", "Cunanan, Kim Gerard D.", "Pecha, Bernadine"],
    "Shift 2": ["Chua, Hillary Gabriel G.", "Angcos, Mark Joseph E.", "Diaz, Relyn Ann", "Daquila, Eric John", "Baluaro, Bernard"],
    "Shift 3": ["Cayao, Leomyr D.", "Martinez, Mart Angelo G."],
    "Day Off": ["Dusaran, John Paul E.", "Alcontin, Joshua M.", "Diano, Hitler B.", "Salimbot, Jomar"]
  },
  "Saturday": {
    "Shift 1": ["Alcontin, Joshua M.", "Fernandez, Joanalyn Y.", "Uson, John Clifford B.", "Escamilla, Jan Denise J.", "Cunanan, Kim Gerard D."],
    "Shift 2": ["Miranda, Jaylord M.", "Angcos, Mark Joseph E.", "Daquila, Eric John", "Pecha, Bernadine"],
    "Shift 3": ["Chua, Hillary Gabriel G.", "Diaz, Relyn Ann", "Baluaro, Bernard"],
    "Day Off": ["Diano, Hitler B.", "Dusaran, John Paul E.", "Salimbot, Jomar", "Cayao, Leomyr D.", "Martinez, Mart Angelo G.", "Manrique, Jeanne Leigh F."]
  }
};
