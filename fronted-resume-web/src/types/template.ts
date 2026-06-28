/**
 * 简历模板数据结构定义
 * 用于新的渲染引擎系统
 */

// 主题定义
export interface ThemeDefinition {
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    text?: {
      primary: string;
      secondary?: string;
      disabled?: string;
      inverse?: string;
    };
    background?: {
      primary: string;
      secondary?: string;
      tertiary?: string;
      inverse?: string;
    };
    border?: {
      light?: string;
      medium?: string;
      dark?: string;
    };
    [key: string]: any;
  };
  typography?: {
    fontFamily?: {
      body: string;
      headings?: string;
      mono?: string;
    };
    fontSize?: {
      base: string;
      xs?: string;
      sm?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      '3xl'?: string;
      '4xl'?: string;
      headings?: {
        h1?: string;
        h2?: string;
        h3?: string;
        h4?: string;
      };
    };
    fontWeight?: {
      light?: number;
      normal?: number;
      medium?: number;
      semibold?: number;
      bold?: number;
    };
    lineHeight?: {
      tight?: number | string;
      normal?: number | string;
      relaxed?: number | string;
      loose?: number | string;
    };
  };
  spacing?: {
    unit?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    xxl?: string;
    section?: string;
    block?: string;
    item?: string;
  };
  borders?: {
    radius?: {
      none?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      full?: string;
    };
    width?: {
      thin?: string;
      normal?: string;
      thick?: string;
    };
    style?: {
      solid?: string;
      dashed?: string;
      dotted?: string;
    };
  };
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    inner?: string;
    none?: string;
  };
  [key: string]: any;
}

// 全局样式
export interface GlobalStyles {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  padding?: string;
  margin?: string;
  css?: string;
  style?: Record<string, any>;
  elements?: {
    [selector: string]: Record<string, string>;
  };
}

// 响应式配置
export interface ResponsiveConfig {
  breakpoints?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
    [key: string]: string | undefined;
  };
  grid?: {
    mobile?: { columns: number; gap?: string };
    tablet?: { columns: number; gap?: string };
    desktop?: { columns: number; gap?: string };
    wide?: { columns: number; gap?: string };
    [key: string]: { columns: number; gap?: string } | undefined;
  };
  styles?: {
    base?: Record<string, any>;
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;
    desktop?: Record<string, any>;
    wide?: Record<string, any>;
    [key: string]: Record<string, any> | undefined;
  };
}

// 布局配置
export interface LayoutConfig {
  type: 'single-column' | 'two-column' | 'three-column' | 'custom';
  columns?: {
    count?: number;
    widths?: string[];
    gap?: string;
    leftStyle?: Record<string, string>;
    middleStyle?: Record<string, string>;
    rightStyle?: Record<string, string>;
  };
  container?: {
    width?: string;
    maxWidth?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    borderRadius?: string;
    boxShadow?: string;
    [key: string]: any;
  };
  content?: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    borderRadius?: string;
    boxShadow?: string;
    [key: string]: any;
  };
  schema?: any;
  custom?: any;
}

// 标题样式
export interface TitleStyle {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  margin?: string;
  padding?: string;
  textAlign?: 'left' | 'center' | 'right';
  background?: string;
  border?: string;
  component?: string;
  special?: {
    type: 'ribbon' | 'underline' | 'boxed' | 'none';
    config?: {
      color?: string;
      textColor?: string;
      padding?: string;
      margin?: string;
      afterRight?: string;
      afterWidth?: string;
      borderSize?: string;
      lineWidth?: string;
      lineHeight?: string;
      lineColor?: string;
      marginBottom?: string;
      paddingBottom?: string;
      borderWidth?: string;
      borderColor?: string;
      [key: string]: any;
    };
  };
  [key: string]: any;
}

// 内容样式
export interface ContentStyle {
  fontSize?: string;
  lineHeight?: string;
  color?: string;
  padding?: string;
  margin?: string;
  [key: string]: any;
}

// 项目样式
export interface ItemsStyle {
  spacing?: string;
  padding?: string;
  margin?: string;
  separator?: {
    type: 'none' | 'solid' | 'dashed' | 'dotted';
    color?: string;
    width?: string;
    margin?: string;
  };
  [key: string]: any;
}

// 模块样式
export interface SectionStyle {
  container?: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    borderRadius?: string;
    boxShadow?: string;
    border?: string;
    [key: string]: any;
  };
  title?: TitleStyle;
  content?: ContentStyle;
  items?: ItemsStyle;
  custom?: {
    [selector: string]: Record<string, any>;
  };
  [key: string]: any;
}

// 模块样式映射
export interface SectionStylesMap {
  [moduleType: string]: SectionStyle;
}

// 完整的模板定义
export interface TemplateDefinition {
  // 基本信息
  templateName: string;
  version?: string;
  description?: string;
  author?: string;
  tags?: string[];
  previewImage?: string;
  
  // 主题定义
  theme?: ThemeDefinition;
  
  // 全局样式
  globalStyles?: GlobalStyles;
  
  // 布局配置
  layout?: LayoutConfig;
  
  // 响应式配置
  responsive?: ResponsiveConfig;
  
  // 各模块样式
  sectionStyles?: SectionStylesMap;
  
  // 自定义CSS
  customCss?: string;
}

// 简历数据定义
export interface ResumeData {
  profile?: {
    basic?: {
      name?: string;
      title?: string;
      gender?: string;
      age?: string;
      yearsOfExperience?: string;
      contacts?: {
        email?: string;
        phone?: string;
        address?: string;
        site?: string;
        [key: string]: any;
      };
      avatar?: string;
      [key: string]: any;
    };
    summary?: string;
    [key: string]: any;
  };
  sections?: Array<{
    id: string;
    type: string;
    title: string;
    visible: boolean;
    order: number;
    items: any[] | Record<string, any>;
    config?: Record<string, any>;
    style?: Record<string, any>;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// 简历渲染器参数
export interface ResumeRendererProps {
  template: TemplateDefinition;
  resumeData: ResumeData;
  containerId?: string;
  customCss?: string;
  debug?: boolean;
}
