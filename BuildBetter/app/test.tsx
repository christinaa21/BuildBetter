import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Button from '@/component/Button';
import { theme } from '../app/theme';
import { typography } from '@/app/theme/typography';
import { MaterialIcons } from '@expo/vector-icons';
import Dropdown from '@/component/Dropdown';
import locationData from '@/data/location.json';

const Test = () => {
  const provinces = locationData.provinces.map(province => ({
    label: province.label,
    value: province.value
  }));

  const getCities = (provinceValue: string) => {
    const province = locationData.provinces.find(p => p.value === provinceValue);
    return province?.cities || [];
  };
  // Helper function to create a section of buttons
  const renderButtonSection = (title: string) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, typography.subtitle2]}>{title}</Text>
      <View>
        <Button 
          title="Button" 
          variant="primary"
          style={styles.buttonSpacing}
        />
        <Button 
          title="Button" 
          variant="outline"
          style={styles.buttonSpacing}
        />
      </View>
    </View>
  );

  // Helper function to create a section of buttons with icons
  const renderIconButtonSection = (title: string, iconPosition: 'left' | 'right') => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, typography.subtitle2]}>{title}</Text>
      <View>
        <Button 
          title="Button"
          variant="primary"
          icon={<MaterialIcons name="chevron-right" size={40}/>}
          iconPosition={iconPosition}
          style={styles.buttonSpacing}
        />
        <Button 
          title="Button"
          variant="outline"
          icon={<MaterialIcons name="chevron-right" size={40} />}
          iconPosition={iconPosition}
          style={styles.buttonSpacing}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.pageTitle, typography.subtitle1]}>Button Component Demo</Text>
        
        {/* Normal Buttons */}
        {renderButtonSection('Normal Buttons')}

        {/* Disabled Buttons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, typography.subtitle2]}>Disabled Buttons</Text>
          <View>
            <Button 
              title="Button"
              variant="primary"
              disabled
              style={styles.buttonSpacing}
            />
            <Button 
              title="Button"
              variant="outline"
              disabled
              style={styles.buttonSpacing}
            />
          </View>
        </View>

        {/* Buttons with Left Icons */}
        {renderIconButtonSection('Buttons with Left Icons', 'left')}

        {/* Buttons with Right Icons */}
        {renderIconButtonSection('Buttons with Right Icons', 'right')}

        {/* Disabled Buttons with Icons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, typography.subtitle2]}>Disabled Buttons with Icons</Text>
          <View>
            <Button 
              title="Button"
              variant="primary"
              icon={<MaterialIcons name="chevron-right"/>}
              iconPosition="left"
              disabled
              style={styles.buttonSpacing}
            />
            <Button 
              title="Button"
              variant="outline"
              icon={<MaterialIcons name="chevron-right"/>}
              iconPosition="right"
              disabled
              style={styles.buttonSpacing}
            />
          </View>
        </View>

        {/* Interactive Demo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, typography.subtitle2]}>Interactive Demo</Text>
          <View style={styles.buttonGrid}>
            <Button 
              title="Click Me"
              variant="primary"
              onPress={() => alert('Primary button clicked!')}
              style={styles.buttonSpacing}
            />
            <Button 
              title="Click Me"
              variant="outline"
              onPress={() => alert('Outline button clicked!')}
              style={styles.buttonSpacing}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  content: {
    padding: 24,
  },
  pageTitle: {
    marginBottom: 32,
    color: theme.colors.customGreen[600],
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    color: theme.colors.customGreen[700],
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  buttonSpacing: {
    marginBottom: 8,
    marginRight: 8,
  },
});

export default Test;