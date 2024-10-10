import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';

interface CardLandingProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType; 
  title: string;
  description: string;
}

export const CardLanding: React.FC<CardLandingProps> = ({
  icon: Icon,
  title,
  description,
  className,
  ...props
}) => {
  return (
    <Card
      className={`h-60 w-60 transform overflow-hidden border-none bg-raffle-highlight p-0 transition-transform duration-300 hover:-translate-y-2 ${className}`}
      {...props}
    >
      <CardHeader className="flex-wrap">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-raffle-main/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-raffle-main">
            <Icon className="w-6 text-whiteCustom" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-blackCustom/60">{description}</p>
      </CardContent>
    </Card>
  );
};
