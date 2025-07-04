import type { PropsWithChildren, ReactElement } from "react";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";

const MAX_HEADER_HEIGHT = 350;
const MIN_HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerTitle: string;
  redirect: string;
  redirectText: string;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerTitle,
  redirectText,
  redirect
}: Props) {
  const colorScheme = useColorScheme() ?? "light";

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollOffset.value,
      [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
      [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
      "clamp",
    );
    return { height };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          headerStyle,
        ]}
      >
        <ThemedView style={styles.headerImage}>{headerImage}</ThemedView>
        <ThemedView>
          <Pressable
            onPress={() => router.push(redirect)}
            style={styles.flexRow}
          >
            <IconSymbol name="chevron.left" color="#000" />
            <ThemedText style={styles.backToHome}>{redirectText}</ThemedText>
          </Pressable>

          <ThemedView>
            <ThemedText type="title" style={styles.title}>
              {headerTitle}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{
          paddingTop: MAX_HEADER_HEIGHT,
          paddingBottom: bottom,
        }}
      >
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const PRIMARY = "#EB7F15";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 48,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    backgroundColor: "#fff",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    paddingLeft: 16,
  },
  backToHome: {
    color: "#000",
  },
  title: {
    paddingVertical: 20,
    textAlign: "center",
    backgroundColor: PRIMARY,
    color: "#fff",
  },
});
