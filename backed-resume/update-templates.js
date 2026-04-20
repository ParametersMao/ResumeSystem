'use strict';

const mysql = require('mysql2/promise');

// ── 模板1: 简约黑白 (Single Column) ─────────────────────────────────────────
const template1 = {
  theme: {
    colors: {
      primary: '#111111',
      secondary: '#f5f5f5',
      accent: '#888888',
      text: {
        primary: '#1a1a1a',
        secondary: '#555555',
        muted: '#999999'
      },
      background: {
        primary: '#ffffff',
        secondary: '#fafafa',
        tertiary: '#f0f0f0'
      },
      border: {
        light: '#e5e5e5',
        medium: '#cccccc',
        dark: '#999999'
      }
    },
    typography: {
      fontFamily: {
        body: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif",
        headings: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif"
      },
      fontSize: {
        base: '14px',
        xs: '12px',
        sm: '13px',
        lg: '16px',
        xl: '18px',
        '2xl': '22px',
        '3xl': '26px'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.3,
        normal: 1.6,
        relaxed: 1.8
      }
    },
    spacing: {
      unit: '8px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      section: '20px',
      block: '16px',
      item: '12px'
    },
    borders: {
      radius: {
        none: '0',
        sm: '2px',
        md: '4px',
        lg: '8px'
      },
      width: {
        thin: '0.5px',
        normal: '1px',
        thick: '2px'
      }
    }
  },
  globalStyles: {
    backgroundColor: '#ffffff',
    fontFamily: "var(--typography-fontFamily-body)",
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--colors-text-primary)',
    elements: {
      'h1, h2, h3, h4': {
        fontFamily: "var(--typography-fontFamily-headings)",
        marginTop: '0',
        marginBottom: '12px',
        lineHeight: '1.3',
        color: 'var(--colors-primary)'
      },
      'p': { margin: '0 0 10px 0', lineHeight: '1.6' },
      'ul, ol': { paddingLeft: '20px', marginBottom: '10px' },
      'li': { marginBottom: '4px' }
    }
  },
  layout: {
    type: 'single-column',
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 48px',
      backgroundColor: '#ffffff',
      borderRadius: '0'
    },
    content: {
      padding: '0',
      backgroundColor: '#ffffff'
    }
  },
  responsive: {
    breakpoints: {
      mobile: '0px',
      tablet: '768px',
      desktop: '1024px'
    },
    styles: {
      mobile: {
        '.resume-content': { padding: '20px 24px' }
      },
      tablet: {
        '.resume-content': { padding: '32px 40px' }
      }
    }
  },
  sectionStyles: {
    basic: {
      container: { marginBottom: '24px' },
      title: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textAlign: 'center',
        marginBottom: '6px',
        letterSpacing: '2px'
      },
      content: {
        fontSize: '15px',
        color: 'var(--colors-text-secondary)',
        textAlign: 'center',
        lineHeight: '1.8'
      }
    },
    summary: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: {
        fontSize: '14px',
        lineHeight: '1.8',
        color: 'var(--colors-text-primary)'
      }
    },
    education: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' },
      items: {
        spacing: '12px',
        separator: { type: 'none' }
      }
    },
    experience: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' },
      items: {
        spacing: '14px',
        separator: { type: 'none' }
      }
    },
    projects: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' },
      items: {
        spacing: '12px',
        separator: { type: 'none' }
      }
    },
    skills: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.8' },
      items: { spacing: '6px', separator: { type: 'none' } }
    },
    intention: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' }
    },
    internship: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' }
    },
    campus: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' }
    },
    awards: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' }
    },
    hobbies: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' }
    },
    custom: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--colors-border-light)',
        paddingBottom: '6px'
      },
      content: { fontSize: '14px', lineHeight: '1.7' }
    }
  },
  customCss: ''
};

// ── 模板2: 蓝色专业 (Two Column) ─────────────────────────────────────────────
const template2 = {
  theme: {
    colors: {
      primary: '#1a56db',
      secondary: '#eff6ff',
      accent: '#3b82f6',
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#94a3b8'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9'
      },
      border: {
        light: '#e2e8f0',
        medium: '#cbd5e1',
        dark: '#94a3b8'
      }
    },
    typography: {
      fontFamily: {
        body: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif",
        headings: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif"
      },
      fontSize: {
        base: '13px',
        xs: '11px',
        sm: '12px',
        lg: '15px',
        xl: '17px',
        '2xl': '20px',
        '3xl': '24px'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.3,
        normal: 1.65,
        relaxed: 1.8
      }
    },
    spacing: {
      unit: '8px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      section: '18px',
      block: '14px',
      item: '10px'
    },
    borders: {
      radius: {
        none: '0',
        sm: '2px',
        md: '6px',
        lg: '10px'
      },
      width: {
        thin: '0.5px',
        normal: '1px',
        thick: '2px'
      }
    }
  },
  globalStyles: {
    backgroundColor: '#ffffff',
    fontFamily: "var(--typography-fontFamily-body)",
    fontSize: '13px',
    lineHeight: '1.65',
    color: 'var(--colors-text-primary)',
    elements: {
      'h1, h2, h3, h4': {
        fontFamily: "var(--typography-fontFamily-headings)",
        marginTop: '0',
        marginBottom: '10px',
        lineHeight: '1.3',
        color: 'var(--colors-primary)'
      },
      'p': { margin: '0 0 8px 0', lineHeight: '1.65' },
      'ul, ol': { paddingLeft: '16px', marginBottom: '8px' },
      'li': { marginBottom: '3px' }
    }
  },
  layout: {
    type: 'two-column',
    columns: {
      widths: ['30%', '70%'],
      gap: '20px',
      leftStyle: {
        backgroundColor: '#1a56db',
        padding: '28px 20px',
        borderRadius: '6px'
      },
      middleStyle: undefined,
      rightStyle: {
        padding: '28px 24px',
        backgroundColor: '#ffffff'
      }
    },
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '32px 0',
      backgroundColor: '#f8fafc'
    },
    content: {
      padding: '0'
    }
  },
  responsive: {
    breakpoints: {
      mobile: '0px',
      tablet: '768px',
      desktop: '1024px'
    },
    styles: {
      mobile: {
        '.resume-content': { flexDirection: 'column !important' }
      }
    }
  },
  sectionStyles: {
    basic: {
      container: { marginBottom: '20px' },
      title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'left',
        marginBottom: '8px',
        letterSpacing: '1px'
      },
      content: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'left',
        lineHeight: '1.8'
      }
    },
    summary: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--colors-primary)'
      },
      content: { fontSize: '13px', lineHeight: '1.7', color: 'var(--colors-text-primary)' }
    },
    education: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--colors-primary)'
      },
      content: { fontSize: '13px', lineHeight: '1.65' },
      items: { spacing: '10px', separator: { type: 'none' } }
    },
    experience: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--colors-primary)'
      },
      content: { fontSize: '13px', lineHeight: '1.65' },
      items: { spacing: '10px', separator: { type: 'none' } }
    },
    projects: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--colors-primary)'
      },
      content: { fontSize: '13px', lineHeight: '1.65' },
      items: { spacing: '10px', separator: { type: 'none' } }
    },
    skills: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '10px',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      },
      content: { fontSize: '12px', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)' },
      items: { spacing: '4px', separator: { type: 'none' } }
    },
    intention: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '10px',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      },
      content: { fontSize: '12px', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)' }
    },
    internship: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--colors-primary)'
      },
      content: { fontSize: '13px', lineHeight: '1.65' }
    },
    campus: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--colors-primary)'
      },
      content: { fontSize: '13px', lineHeight: '1.65' }
    },
    awards: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '10px',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      },
      content: { fontSize: '12px', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)' }
    },
    hobbies: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '10px',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      },
      content: { fontSize: '12px', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)' }
    },
    custom: {
      container: { marginBottom: '18px' },
      title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--colors-primary)'
      },
      content: { fontSize: '13px', lineHeight: '1.65' }
    }
  },
  customCss: ''
};

// ── 模板3: 绿色清新 (Three Column) ───────────────────────────────────────────
const template3 = {
  theme: {
    colors: {
      primary: '#059669',
      secondary: '#ecfdf5',
      accent: '#10b981',
      text: {
        primary: '#064e3b',
        secondary: '#047857',
        muted: '#6ee7b7'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f0fdf4',
        tertiary: '#d1fae5'
      },
      border: {
        light: '#a7f3d0',
        medium: '#6ee7b7',
        dark: '#34d399'
      }
    },
    typography: {
      fontFamily: {
        body: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif",
        headings: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif"
      },
      fontSize: {
        base: '13px',
        xs: '11px',
        sm: '12px',
        lg: '15px',
        xl: '17px',
        '2xl': '20px',
        '3xl': '24px'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.3,
        normal: 1.65,
        relaxed: 1.8
      }
    },
    spacing: {
      unit: '8px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      section: '16px',
      block: '12px',
      item: '8px'
    },
    borders: {
      radius: {
        none: '0',
        sm: '3px',
        md: '8px',
        lg: '12px'
      },
      width: {
        thin: '0.5px',
        normal: '1px',
        thick: '2px'
      }
    }
  },
  globalStyles: {
    backgroundColor: '#f0fdf4',
    fontFamily: "var(--typography-fontFamily-body)",
    fontSize: '13px',
    lineHeight: '1.65',
    color: 'var(--colors-text-primary)',
    elements: {
      'h1, h2, h3, h4': {
        fontFamily: "var(--typography-fontFamily-headings)",
        marginTop: '0',
        marginBottom: '10px',
        lineHeight: '1.3',
        color: 'var(--colors-primary)'
      },
      'p': { margin: '0 0 8px 0', lineHeight: '1.65' },
      'ul, ol': { paddingLeft: '16px', marginBottom: '8px' },
      'li': { marginBottom: '3px' }
    }
  },
  layout: {
    type: 'three-column',
    columns: {
      widths: ['25%', '40%', '35%'],
      gap: '16px',
      leftStyle: {
        backgroundColor: '#10b981',
        padding: '24px 16px',
        borderRadius: '8px'
      },
      middleStyle: {
        padding: '24px 16px',
        backgroundColor: '#ffffff'
      },
      rightStyle: {
        backgroundColor: '#ffffff',
        padding: '24px 16px',
        borderRadius: '8px',
        border: '1px solid #a7f3d0'
      }
    },
    container: {
      maxWidth: '960px',
      margin: '0 auto',
      padding: '32px 0',
      backgroundColor: '#f0fdf4'
    },
    content: {
      padding: '0'
    }
  },
  responsive: {
    breakpoints: {
      mobile: '0px',
      tablet: '768px',
      desktop: '1024px'
    },
    styles: {
      mobile: {
        '.resume-content': { flexDirection: 'column !important' }
      }
    }
  },
  sectionStyles: {
    basic: {
      container: { marginBottom: '16px' },
      title: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: '6px',
        letterSpacing: '1px'
      },
      content: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.88)',
        textAlign: 'center',
        lineHeight: '1.7'
      }
    },
    summary: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.7', color: 'var(--colors-text-primary)' }
    },
    education: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.65' },
      items: { spacing: '8px', separator: { type: 'none' } }
    },
    experience: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.65' },
      items: { spacing: '8px', separator: { type: 'none' } }
    },
    projects: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.65' },
      items: { spacing: '8px', separator: { type: 'none' } }
    },
    skills: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        marginBottom: '8px',
        paddingBottom: '3px',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      },
      content: { fontSize: '11px', lineHeight: '1.8', color: 'rgba(255,255,255,0.88)' },
      items: { spacing: '3px', separator: { type: 'none' } }
    },
    intention: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        marginBottom: '8px',
        paddingBottom: '3px',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      },
      content: { fontSize: '11px', lineHeight: '1.8', color: 'rgba(255,255,255,0.88)' }
    },
    internship: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.65' }
    },
    campus: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.65' }
    },
    awards: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.65' }
    },
    hobbies: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        marginBottom: '8px',
        paddingBottom: '3px',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      },
      content: { fontSize: '11px', lineHeight: '1.8', color: 'rgba(255,255,255,0.88)' }
    },
    custom: {
      container: { marginBottom: '14px' },
      title: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--colors-primary)',
        marginBottom: '6px',
        borderBottom: '2px solid var(--colors-border-medium)',
        paddingBottom: '3px'
      },
      content: { fontSize: '12px', lineHeight: '1.65' }
    }
  },
  customCss: ''
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'resume_system',
    charset: 'utf8mb4'
  });

  const updates = [
    { id: 1, name: 'Simple Black White', data: template1 },
    { id: 2, name: 'Blue Professional', data: template2 },
    { id: 3, name: 'Green Fresh', data: template3 }
  ];

  for (const { id, name, data } of updates) {
    const json = JSON.stringify(data);
    const size = Buffer.byteLength(json, 'utf8');
    await pool.execute(
      'UPDATE templates SET html_content = ? WHERE id = ?',
      [json, id]
    );
    console.log(`✅ Template [${id}] "${name}" updated (${(size / 1024).toFixed(1)} KB)`);
  }

  await pool.end();
  console.log('\n🎉 All templates updated successfully!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
