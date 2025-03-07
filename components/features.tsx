'use client';

import { DotLottieCommonPlayer } from '@dotlottie/react-player';
import ProductImage from '@/assets/product-image.png';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  ValueAnimationTransition,
} from 'framer-motion';
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react';


const tabs = [
  {
    title: 'Real-time detection of dangerous activity',
    isNew: false,
    backgroundPositionX: 0,
    backgroundPositionY: 0,
    backgroundSizeX: 150,
    image:"real-time.jpeg"
  },
  {
    title: 'Upload Feature',
    isNew: false,
    backgroundPositionX: 98,
    backgroundPositionY: 100,
    backgroundSizeX: 135,
    image:"upload.jpeg"
  },
  {
    title: 'Statistics page',
    backgroundPositionX: 100,
    backgroundPositionY: 27,
    backgroundSizeX: 177,
    image:"statistics.jpeg"
  },
  {
    title: 'TrackX',
    isNew: true,
    backgroundPositionX: 100,
    backgroundPositionY: 27,
    backgroundSizeX: 177,
    image:"trackx.jpeg"
  },

];

const FeatureTab = (
  props: (typeof tabs)[number] &
    ComponentPropsWithoutRef<'div'> & { selected: boolean }
) => {
  const tabRef = useRef<HTMLDivElement>(null);
  const dotLottieRef = useRef<DotLottieCommonPlayer>(null);

  const xPercentage = useMotionValue(0);
  const yPercentage = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(80px 80px at ${xPercentage}% ${yPercentage}%, black, transparent)`;

  useEffect(() => {
    if (!tabRef.current || !props.selected) return;

    xPercentage.set(0);
    yPercentage.set(0);
    const { height, width } = tabRef.current?.getBoundingClientRect();
    const circumference = height * 2 + width * 2;
    const times = [
      0,
      width / circumference,
      (width + height) / circumference,
      (width * 2 + height) / circumference,
      1,
    ];

    const options: ValueAnimationTransition = {
      times,
      duration: 5,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'linear',
    };

    animate(xPercentage, [0, 100, 100, 0, 0], options);
    animate(yPercentage, [0, 0, 100, 100, 0], options);
  }, [props.selected]);

  const handleTabHover = () => {
    if (dotLottieRef.current === null) return;
    dotLottieRef.current.seek(0);
    dotLottieRef.current.play();
  };

  return (
    <div
      onMouseEnter={handleTabHover}
      className={
        'relative flex cursor-pointer items-center gap-2.5 rounded-xl border border-muted p-2.5 hover:bg-muted/30'
      }
      ref={tabRef}
      onClick={props.onClick}
    >
      {props.selected && (
        <motion.div
          style={{ maskImage }}
          className={
            'absolute inset-0 -m-px rounded-xl border border-[#A369FF]'
          }
        />
      )}

      <div className={'size-12'}></div>
      <div className={'font-medium'}>{props.title}</div>
      {props.isNew && (
        <div
          className={
            'rounded-full bg-[#8c44ff] px-2 py-0.5 text-xs font-semibold text-white'
          }
        >
          New
        </div>
      )}
    </div>
  );
};

export function Features() {
  const [selectedTab, setSelectedTab] = useState(0);

  const backgroundPositionX = useMotionValue(tabs[0].backgroundPositionX);
  const backgroundPositionY = useMotionValue(tabs[0].backgroundPositionY);
  const backgroundSizeX = useMotionValue(tabs[0].backgroundSizeX);

  const backgroundPosition = useMotionTemplate`${backgroundPositionX}% ${backgroundPositionY}%`;
  const backgroundSize = useMotionTemplate`${backgroundSizeX}% auto`;

  const handleSelectTab = (index: number) => {
    setSelectedTab(index);

    const animateOptions: ValueAnimationTransition = {
      duration: 2,
      ease: 'easeInOut',
    };
    animate(
      backgroundSizeX,
      [backgroundSizeX.get(), 100, tabs[index].backgroundSizeX],
      animateOptions
    );
    animate(
      backgroundPositionX,
      [backgroundPositionX.get(), tabs[index].backgroundPositionX],
      animateOptions
    );
    animate(
      backgroundPositionY,
      [backgroundPositionY.get(), tabs[index].backgroundPositionY],
      animateOptions
    );
  };

  return (
    <>
      <section className={'py-20 md:py-24'}>
        <div className={'container'}>
          <h2
            className={
              'text-center text-5xl font-medium tracking-tighter md:text-6xl'
            }
          >
            Features of our IntellexAI.
          </h2>
          <p
            className={
              'mx-auto mt-5 max-w-2xl text-center text-lg tracking-tight text-white/70 md:text-xl'
            }
          >
            Intellex AI is an intelligent video surveillance platform that
            detects crime, suspicious activities and life threatening events
            such as fainting and choking and sends phone alerts to alert
            security of the issue
          </p>

          <div className={'mt-10 grid gap-3 lg:grid-cols-3'}>
            {tabs.map((tab, index) => (
              <FeatureTab
                {...tab}
                key={tab.title}
                onClick={() => handleSelectTab(index)}
                selected={selectedTab === index}
              />
            ))}
          </div>
          <motion.div className={"border border-muted rounded-xl p-2.5 mt-3"}>
            <div
              className={"aspect-video object-cover bg-cover border border-muted rounded-lg"}
              style={{
                backgroundPosition: backgroundPosition.get(),
                backgroundImage: `url(${tabs[selectedTab].image})`,
              }}
            ></div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
