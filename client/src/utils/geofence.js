// Geofencing configuration
export const GEOFENCE_RADIUS = 100; // meters

// Define gym locations [latitude, longitude]
export const GYM_LOCATIONS = [
  { id: "main_gym", name: "Main Gym", lat: 28.6139, lng: 77.209 },
  // Add more gym locations here
];

// Calculate distance between two coordinates (Haversine formula)
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Check if user is within geofence
export const isInsideGeofence = (userLat, userLon, gym) => {
  const distance = getDistanceFromLatLonInMeters(
    userLat,
    userLon,
    gym.lat,
    gym.lng,
  );
  return distance <= GEOFENCE_RADIUS;
};

// Request location and check geofence
export const checkGeofence = async () => {
  if (!("geolocation" in navigator)) {
    return { inside: false, gym: null };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        for (const gym of GYM_LOCATIONS) {
          if (isInsideGeofence(latitude, longitude, gym)) {
            // Store arrival time for reminder triggers
            const arrivalData = {
              gymId: gym.id,
              arrivedAt: Date.now(),
              coords: { latitude, longitude },
            };
            localStorage.setItem("lastGymVisit", JSON.stringify(arrivalData));

            resolve({ inside: true, gym, coords: { latitude, longitude } });
            return;
          }
        }

        resolve({ inside: false, gym: null, coords: { latitude, longitude } });
      },
      (error) => {
        console.log("Geolocation error:", error);
        resolve({ inside: false, gym: null, error });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
};

// Monitor geofence changes (poll every 5 minutes)
let geofenceInterval = null;

export const startGeofenceMonitoring = (
  onEnter,
  onExit,
  interval = 5 * 60 * 1000,
) => {
  if (geofenceInterval) clearInterval(geofenceInterval);

  let lastState = null;
  let lastGym = null;

  geofenceInterval = setInterval(async () => {
    const result = await checkGeofence();

    if (result.inside && lastState !== true) {
      // Entered geofence
      lastState = true;
      lastGym = result.gym;
      if (onEnter) onEnter(result.gym);
    } else if (!result.inside && lastState === true) {
      // Exited geofence
      lastState = false;
      if (onExit) onExit(lastGym);
      lastGym = null;
      localStorage.removeItem("lastGymVisit");
    }
  }, interval);
};

export const stopGeofenceMonitoring = () => {
  if (geofenceInterval) {
    clearInterval(geofenceInterval);
    geofenceInterval = null;
  }
};

// Get last gym visit time
export const getLastGymVisit = () => {
  try {
    const data = localStorage.getItem("lastGymVisit");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};
