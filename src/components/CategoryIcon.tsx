import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Zap,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  CreditCard,
  Plane,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  MoreHorizontal,
  Tag,
  DollarSign,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils size={size} className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart size={size} className={className} />;
    case 'Home':
      return <Home size={size} className={className} />;
    case 'Zap':
      return <Zap size={size} className={className} />;
    case 'Car':
      return <Car size={size} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} className={className} />;
    case 'Film':
      return <Film size={size} className={className} />;
    case 'HeartPulse':
      return <HeartPulse size={size} className={className} />;
    case 'CreditCard':
      return <CreditCard size={size} className={className} />;
    case 'Plane':
      return <Plane size={size} className={className} />;
    case 'Briefcase':
      return <Briefcase size={size} className={className} />;
    case 'Laptop':
      return <Laptop size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    case 'Gift':
      return <Gift size={size} className={className} />;
    case 'Coins':
      return <Coins size={size} className={className} />;
    case 'DollarSign':
      return <DollarSign size={size} className={className} />;
    default:
      return <Tag size={size} className={className} />;
  }
};
