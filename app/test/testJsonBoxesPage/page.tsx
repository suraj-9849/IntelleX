'use client';
import BoundingBoxDrawer from '@/components/boundingBoxDrawer';

const boxes = [
  { box_2d: [21, 319, 233, 612], label: 'book' },
  { box_2d: [187, 195, 387, 472], label: 'smartphone' },
  { box_2d: [356, 306, 933, 715], label: 'spiral notebook' },
  { box_2d: [416, 763, 625, 972], label: 'pen' },
  { box_2d: [25, 19, 402, 268], label: 'green plant' },
  { box_2d: [360, 0, 606, 187], label: 'wicker coaster' },
  { box_2d: [897, 406, 947, 756], label: 'orange pencil' },
  { box_2d: [356, 696, 702, 1000], label: 'pen case' },
  { box_2d: [0, 493, 262, 821], label: 'white headphones' },
];

export default function ImageWithBoundingBoxes() {
  const imageUrl = '/tableWithThings.jpg';

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-black p-4'>
      <div className='w-full max-w-md space-y-8 text-center'>
        <h1 className='mb-6 text-3xl font-bold text-white md:text-4xl'>
          Bounding Boxes on Image
        </h1>
        <BoundingBoxDrawer imageUrl={imageUrl} boxes={boxes} />
      </div>
    </main>
  );
}
