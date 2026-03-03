import React, { memo } from 'react';
import { Text, TouchableOpacity, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface WelcomeModeCardProps {
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  onPress: () => void;
  cardStyle: StyleProp<ViewStyle>;
  activeCardStyle: StyleProp<ViewStyle>;
  titleStyle: StyleProp<TextStyle>;
  descriptionStyle: StyleProp<TextStyle>;
  activeTextStyle: StyleProp<TextStyle>;
  iconStyle: StyleProp<TextStyle>;
}

function WelcomeModeCard({
  icon,
  title,
  description,
  isActive,
  onPress,
  cardStyle,
  activeCardStyle,
  titleStyle,
  descriptionStyle,
  activeTextStyle,
  iconStyle,
}: WelcomeModeCardProps) {
  return (
    <TouchableOpacity style={[cardStyle, isActive && activeCardStyle]} onPress={onPress} activeOpacity={0.9}>
      <Text style={iconStyle}>{icon}</Text>
      <Text style={[titleStyle, isActive && activeTextStyle]}>{title}</Text>
      <Text style={[descriptionStyle, isActive && activeTextStyle]}>{description}</Text>
    </TouchableOpacity>
  );
}

export default memo(WelcomeModeCard);
