import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from './AppText';

interface DateTimeCardProps {
  date: string;
  hours: string[];
  selectedGlobal: { date: string; hour: string } | null;
  onSelectHour: (hour: string) => void;
}

export default function DateTimeCard({
  date,
  hours,
  selectedGlobal,
  onSelectHour,
}: DateTimeCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleSelectHour = (hour: string) => {
    onSelectHour(hour);
  };

  return (
    <View style={styles.container}>
      {/* Date + flèche */}
      <TouchableOpacity style={styles.dateRow} onPress={toggleExpanded}>
        <AppText style={styles.dateText}>{date}</AppText>
        <Image
          source={
            expanded
              ? require('../../assets/images/arrow-up.png')
              : require('../../assets/images/arrow-down.png')
          }
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {/* Horaires */}
      {expanded && (
        <View style={styles.hoursContainer}>
          {hours.map((hour) => {
            const isSelected =
              selectedGlobal?.date === date && selectedGlobal?.hour === hour;
            return (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.hourButton,
                  isSelected && styles.hourButtonSelected,
                ]}
                onPress={() => handleSelectHour(hour)}
              >
                <AppText
                  style={[
                    styles.hourButtonText,
                    isSelected && styles.hourButtonTextSelected,
                  ]}
                >
                  {hour}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  arrowIcon: {
    width: 40,
    height: 40,
  },
  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  hourButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  hourButtonSelected: {
    backgroundColor: '#000',
  },
  hourButtonText: {
    color: '#000',
    fontSize: 14,
  },
  hourButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
