import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface AnimatedBubbleProps {
  messages: { id: string; text: string; sender: 'user' | 'bot' }[];
}

const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({ messages }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [messages]);

  return (
    <View style={styles.container}>
      {messages.map((message) => (
        <Animated.View
          key={message.id}
          style={[
            styles.bubble,
            message.sender === 'user' ? styles.userBubble : styles.botBubble,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.text}>{message.text}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  text: {
    fontSize: 16,
  },
});

export default AnimatedBubble;