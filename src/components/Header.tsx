import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { styles } from '../styles/loginScreenStyles';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  const insets = useSafeAreaInsets();
  const { onBack } = props;

  const topOffset = insets.top + 24;

  return (
    <View style={[styles.headerWrapper, { paddingTop: topOffset }]} pointerEvents="box-none">
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityLabel="Back">
          <Svg width={30} height={30} viewBox="0 0 24 24" fill="none" aria-hidden>
            <Path d="M15 6 L9 12 L15 18" stroke="#1B9B92" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default Header;