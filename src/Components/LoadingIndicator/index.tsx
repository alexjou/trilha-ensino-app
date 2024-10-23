import React, { Fragment, memo, ReactElement } from "react";
import { View, ViewStyle } from "react-native";
import { MaterialIndicator } from "react-native-indicators";

interface LoadingIndicatorProps {
  isLoading: boolean;
  color?: string;
  size?: number;
}

export const LoadingIndicator = memo((props: LoadingIndicatorProps): ReactElement => {
  const { isLoading, color = '#F5F5F5', size = 30 } = props;

  return (
    <Fragment>
      {isLoading && (
        <View style={{ height: size } as ViewStyle}>
          <MaterialIndicator size={size} color={color} />
        </View>
      )}
    </Fragment>
  )
});