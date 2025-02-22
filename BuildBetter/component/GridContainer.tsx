import React from 'react';
import { View, StyleSheet } from 'react-native';

// GridContainer.tsx
interface GridContainerProps {
    data: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    numColumns?: number;
    contentContainerStyle?: object;
    columnSpacing?: number;
    rowSpacing?: number;
  }
  
  export const GridContainer: React.FC<GridContainerProps> = ({
    data,
    renderItem,
    numColumns = 1,
    contentContainerStyle,
    columnSpacing = 16,
    rowSpacing = 16,
  }) => {
    return (
      <View style={[
        styles.gridContainer,
        {
          gap: rowSpacing,
        },
        contentContainerStyle
      ]}>
        {chunk(data, numColumns).map((row, rowIndex) => (
          <View 
            key={`row-${rowIndex}`} 
            style={[
              styles.row,
              { gap: columnSpacing }
            ]}
          >
            {row.map((item, index) => (
              <View 
                key={`item-${rowIndex}-${index}`} 
                style={[
                  styles.column,
                  { flex: 1 }
                ]}
              >
                {renderItem(item, rowIndex * numColumns + index)}
              </View>
            ))}
            {/* Fill empty spaces with blank Views to maintain grid structure */}
            {row.length < numColumns && [...Array(numColumns - row.length)].map((_, i) => (
              <View 
                key={`empty-${i}`} 
                style={[
                  styles.column,
                  { flex: 1 }
                ]} 
              />
            ))}
          </View>
        ))}
      </View>
    );
  };
  
  // Helper function to chunk array into rows
  const chunk = <T,>(array: T[], size: number): T[][] => {
    return array.reduce((acc, _, i) => {
      if (i % size === 0) {
        acc.push(array.slice(i, i + size));
      }
      return acc;
    }, [] as T[][]);
  };
  
const styles = StyleSheet.create({
    gridContainer: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    column: {
        minWidth: 0, // Ensures proper flex behavior
    },
});