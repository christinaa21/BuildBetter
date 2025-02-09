import { Text, TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface TypographyProps extends TextProps {
  variant?: 'title' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
  className?: string;
}

const styles = {
    title: "text-[19px] font-poppins-semibold",
    subtitle1: "text-[16px] font-poppins-regular",
    subtitle2: "text-[14px] font-poppins-medium",
    body1: "text-[15px] font-poppins-regular",
    body2: "text-[14px] font-poppins-regular",
    caption: "text-[12px] font-poppins-medium",
    overline: "text-[10px] font-poppins-medium",
};

export default function Typography({ variant = "body1", className, ...props }: TypographyProps) {
  return <Text {...props} className={twMerge(styles[variant], className)} />;
}
