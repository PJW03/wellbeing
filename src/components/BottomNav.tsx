import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

const BottomNav: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftHalf}>
        <TouchableOpacity style={styles.iconBox} activeOpacity={0.8}>
          <FeatherIcon name="pie-chart" size={27} color="#7ea3ed" />
        </TouchableOpacity>
      </View>

      <View style={styles.rightHalf}>
        <TouchableOpacity style={styles.homePill} activeOpacity={0.9}>
          <FeatherIcon name="home" size={24} color="#7ea3ed" />
          <Text style={styles.homeText}>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 112,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e7eefc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 3,
  },
  homePill: {
    width: 162,
    height: 48,
    borderRadius: 28,
    backgroundColor: '#dce8ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 3,
  },
  homeText: { fontSize: 32, color: '#7ea3ed', fontWeight: '400', lineHeight: 34 },
});

export default BottomNav;
