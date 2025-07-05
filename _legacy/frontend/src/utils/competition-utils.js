export const getSXHeatCompetitorColor = (startOrder) => {
  switch (startOrder) {
    case 1:
      return '--athlete-red';
    case 2:
      return '--athlete-green';
    case 3:
      return '--athlete-blue';
    case 4:
      return '--athlete-yellow';

    default:
      return 'transparent';
  }
};
export const getDMOHeatCompetitorColor = (startOrder) => {
  switch (startOrder) {
    case 1:
      return '--athlete-blue';
    case 2:
      return '--athlete-red';

    default:
      return 'transparent';
  }
};
