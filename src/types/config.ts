export type CatPropType =
  | 'envelope'
  | 'rose_bouquet'
  | 'coffee_cup'
  | 'star_wand'
  | 'heart_balloon'
  | 'ring_box'
  | 'celebration'
  | 'broken_heart'
  | 'none';

export type CatPoseType =
  | 'idle'
  | 'holding_envelope'
  | 'holding_cup'
  | 'holding_wand'
  | 'presenting_flowers'
  | 'presenting_ring'
  | 'celebrating'
  | 'sad';

export type CatExpressionType =
  | 'happy'
  | 'blushing'
  | 'curious'
  | 'excited'
  | 'loving'
  | 'proposal_love'
  | 'celebrating'
  | 'sad';

export interface QuestionOption {
  id: string;
  text: string;
  reactionMessage: string;
  nextProp?: CatPropType;
  nextExpression?: CatExpressionType;
}

export interface QuestionItem {
  id: string;
  stepBadge?: string;
  question: string;
  subtitle?: string;
  catProp: CatPropType;
  catPose?: CatPoseType;
  catExpression: CatExpressionType;
  options: QuestionOption[];
}

export interface IntroScreenConfig {
  enabled: boolean;
  greeting: string;
  message?: string;
  subtext?: string;
  durationSeconds: number;
}

export interface ProposalConfig {
  introScreen?: IntroScreenConfig;
  theme: {
    title: string;
    partnerName: string;
    senderName: string;
    primaryPink: string;
    secondaryPink: string;
    primaryBlue: string;
    secondaryBlue: string;
    accentGold: string;
    backgroundGradient: string;
    cardBackground: string;
    textColor: string;
    textMuted: string;
  };
  music: {
    filePath: string;
    title: string;
    artist: string;
    defaultVolume: number;
    autoplayOnFirstClick: boolean;
  };
  catSettings: {
    furColor: string;
    bellyColor: string;
    earInnerColor: string;
    eyeColor: string;
    blushColor: string;
    collarColor: string;
    bellColor: string;
  };
  questions: QuestionItem[];
  proposal: {
    stepBadge: string;
    title: string;
    mainQuestion: string;
    subtitle: string;
    catProp: CatPropType;
    catPose?: CatPoseType;
    catExpression: CatExpressionType;
    yesButtonText: string;
    noButtonText: string;
  };
  yesResponse: {
    headline: string;
    subheading: string;
    catProp: CatPropType;
    catExpression: CatExpressionType;
    celebrationDelaySeconds: number;
    whatsAppNumber: string;
    whatsAppMessage: string;
    whatsAppNotice: string;
  };
  noResponse: {
    popupMessage: string;
    catProp: CatPropType;
    catExpression: CatExpressionType;
  };
}
