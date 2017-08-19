const opencv = require('../');
const { imreadPromised } = require('./utils');

const { Mat, ORBDetector, SIFTDetector, matchBruteForceHamming, matchFlannBased, drawMatches, imshow } = opencv;

const matchFeatures = ({ img1, img2, detector, matchFunc }) => {
  // detect keypoints
  const keyPoints1 = detector.detect(img1);
  const keyPoints2 = detector.detect(img2);

  // compute feature descriptors
  const descriptors1 = detector.compute(img1, keyPoints1);
  const descriptors2 = detector.compute(img2, keyPoints2);

  // match the feature descriptors
  const matches = matchFunc(descriptors1, descriptors2);

  // only keep good matches
  const bestN = 40;
  const bestMatches = matches.sort((match1, match2) => match1.distance - match2.distance).slice(0, bestN);

  return drawMatches({
    img1,
    img2,
    keypoints1: keyPoints1,
    keypoints2: keyPoints2,
    matches1to2: bestMatches
  });
};

Promise.all([imreadPromised('../data/s0.jpg'), imreadPromised('../data/s1.jpg')])
  .then(([img1, img2]) => {
    // check if opencv compiled with extra modules and nonfree
    if (SIFTDetector) {
      const siftMatchesImg = matchFeatures({
        img1,
        img2,
        detector: new SIFTDetector({ nFeatures: 2000 }),
        matchFunc: matchFlannBased
      });
      imshow('SIFT matches', siftMatchesImg);
    }

    const orbMatchesImg = matchFeatures({
      img1,
      img2,
      detector: new ORBDetector(),
      matchFunc: matchBruteForceHamming
    });
    imshow('ORB matches', orbMatchesImg);
  });