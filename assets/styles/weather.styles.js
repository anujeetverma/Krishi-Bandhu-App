import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
    dashboardWrapper: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    dashboardContainer: {
      flex: 1,
      padding: 20,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: COLORS.text,
    },
    errorText: {
      textAlign: 'center',
      fontSize: 16,
      color: 'red',
    },
    header: {
      marginBottom: 16,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    date: {
      fontSize: 14,
      color: COLORS.textLight,
      marginTop: 4,
    },
    forecastContainer: {
      marginBottom: 24,
    },
    forecastItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    forecastItemSelected: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    forecastText: {
      color: COLORS.text,
      fontSize: 12,
    },
    forecastDate: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    forecastTemp: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 4,
    },
    forecastTextSelected: {
      color: COLORS.white,
    },
    mainCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 20,
      padding: 20,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 10,
    },
    mainCardLeft: {},
    location: {
      fontSize: 16,
      fontWeight: '500',
      color: COLORS.white,
      opacity: 0.9,
    },
    mainTemp: {
      fontSize: 64,
      fontWeight: 'bold',
      color: COLORS.white,
      lineHeight: 70,
    },
    minMaxTemp: {
      fontSize: 14,
      color: COLORS.white,
      marginTop: 8,
      opacity: 0.9,
    },
    mainCardRight: {},
    weatherDescription: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textLight,
        fontWeight: '500'
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 12,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
      width: '45%',
      //marginBottom: 8,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: COLORS.text,
      //marginVertical: 2,
    },
    detailLabel: {
      fontSize: 10,
      color: COLORS.textLight,
    },
    sunGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    sunItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 12,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
      width: '45%',
    },
    sunLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 8,
        marginBottom: 2,
    },
    sunTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: 8,
    },
    infoBlock: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
  });
  

  
  
export default styles;