export const haptic = (type = "light") => {
  if (!navigator.vibrate) return;

  switch (type) {
    case "light":
      navigator.vibrate(10);
      break;
    case "medium":
      navigator.vibrate([10, 20, 10]);
      break;
    case "heavy":
      navigator.vibrate([20, 30, 20]);
      break;
    default:
      navigator.vibrate(5);
  }
};
