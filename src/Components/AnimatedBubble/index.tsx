import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Progress from 'react-native-progress';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  audioUri?: string;
};

interface AnimatedBubbleProps {
  message: Message;
  handlePlayPause: (uri: string) => void;
  isPlaying: boolean;
  position: number;
  duration: number;
}

const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({
  message,
  handlePlayPause,
  isPlaying,
  position,
  duration,
}) => {
  const isUser = message.sender === 'user';
  const progress = duration > 0 ? position / duration : 0;

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <View style={styles.messageContent}>
        {message.text && <Text style={styles.messageText}>{message.text}</Text>}

        {message.audioUri && (
          <View style={styles.audioContainer}>
            <TouchableOpacity
              onPress={() => handlePlayPause(message.audioUri!)}
              style={styles.playButton}
            >
              <Icon
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            <Progress.Bar
              progress={progress}
              width={150}
              color={isUser ? '#fff' : '#007AFF'}
              unfilledColor={isUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,122,255,0.3)'}
              borderWidth={0}
              height={4}
              style={styles.progressBar}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
  },
  messageContent: {
    flexDirection: 'column',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  playButton: {
    padding: 5,
    marginRight: 10,
  },
  progressBar: {
    marginLeft: 5,
  },
});

export default AnimatedBubble;