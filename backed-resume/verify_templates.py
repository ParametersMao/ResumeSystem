# -*- coding: utf-8 -*-
"""Verify database template format against rendering engine expectations."""
import json
import sys

try:
    import mysql.connector
except ImportError:
    print("mysql-connector-python not installed. Run: pip install mysql-connector-python")
    sys.exit(1)

REQUIRED_FIELDS = ['templateName', 'theme', 'layout', 'sectionStyles']
EXPECTED_MODULES = ['basic', 'summary', 'education', 'experience', 'projects',
                    'skills', 'awards', 'intention', 'internship', 'campus',
                    'hobbies', 'custom']

def verify_template(obj, name):
    issues = []
    warnings = []

    # Check top-level fields
    for field in REQUIRED_FIELDS:
        if field not in obj:
            issues.append("Missing required field: %s" % field)

    if 'templateName' not in obj:
        issues.append('Missing templateName')

    # Check theme.colors
    if 'theme' in obj and 'colors' in obj['theme']:
        colors = obj['theme']['colors']
        if 'primary' not in colors:
            issues.append('theme.colors.primary undefined')
        if 'text' not in colors:
            warnings.append('theme.colors.text undefined')
        elif isinstance(colors['text'], str):
            issues.append('theme.colors.text is a string "%s", should be object {primary}' % colors['text'])
        elif isinstance(colors['text'], dict) and 'primary' not in colors['text']:
            issues.append('theme.colors.text.primary undefined')
    else:
        issues.append('theme.colors undefined')

    # Check layout
    if 'layout' in obj:
        if 'type' not in obj['layout']:
            issues.append('layout.type undefined')
        elif obj['layout']['type'] not in ('single-column', 'two-column', 'three-column', 'custom'):
            warnings.append('layout.type "%s" not standard' % obj['layout']['type'])
        if obj['layout'].get('type') == 'two-column':
            if 'columns' not in obj['layout']:
                warnings.append('two-column layout missing layout.columns')
            elif 'widths' not in obj['layout']['columns']:
                warnings.append('two-column layout missing layout.columns.widths')
    else:
        issues.append('layout undefined')

    # Check sectionStyles
    if 'sectionStyles' in obj:
        ss_keys = list(obj['sectionStyles'].keys())
        if len(ss_keys) == 0:
            issues.append('sectionStyles is empty')
        critical = ['basic', 'education', 'experience', 'skills']
        for m in critical:
            if m not in obj['sectionStyles']:
                warnings.append('sectionStyles missing critical module: %s' % m)
        for mod_type, style in obj['sectionStyles'].items():
            if not isinstance(style, dict):
                issues.append('sectionStyles.%s is not an object' % mod_type)
                continue
            if 'container' not in style:
                warnings.append('sectionStyles.%s.container undefined' % mod_type)
            if 'title' not in style:
                warnings.append('sectionStyles.%s.title undefined' % mod_type)
            if 'content' not in style:
                warnings.append('sectionStyles.%s.content undefined' % mod_type)
        print("  Modules (%d): %s" % (len(ss_keys), ', '.join(ss_keys)))
    else:
        issues.append('sectionStyles undefined')

    return issues, warnings

def main():
    try:
        conn = mysql.connector.connect(
            host='localhost', port=3306,
            user='root', password='123456',
            database='resume_system'
        )
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, html_content FROM templates')
        rows = cursor.fetchall()

        all_passed = True

        for row in rows:
            print("")
            print("=" * 60)
            print("Template #%s: %s" % (row[0], row[1]))
            print("=" * 60)

            try:
                obj = json.loads(row[2])
                print("  Name: %s" % obj.get('templateName', 'N/A'))
                print("  Layout type: %s" % obj.get('layout', {}).get('type', 'MISSING'))
                print("  Theme primary: %s" % obj.get('theme', {}).get('colors', {}).get('primary', 'MISSING'))

                text_val = obj.get('theme', {}).get('colors', {}).get('text')
                print("  theme.colors.text: type=%s value=%s" % (type(text_val).__name__, text_val))

                issues, warnings = verify_template(obj, row[1])
                module_count = len(obj.get('sectionStyles', {}))
                print("  Section modules: %d" % module_count)

                if issues:
                    all_passed = False
                    print("\n  ERRORS (%d):" % len(issues))
                    for issue in issues:
                        print("    [X] %s" % issue)

                if warnings:
                    print("\n  WARNINGS (%d):" % len(warnings))
                    for w in warnings:
                        print("    [!] %s" % w)

                if not issues and not warnings:
                    print("\n  [OK] All checks passed!")

            except json.JSONDecodeError as e:
                all_passed = False
                print("  JSON PARSE ERROR: %s" % e)

        cursor.close()
        conn.close()

        print("")
        print("=" * 60)
        if all_passed:
            print("All templates verified OK!")
        else:
            print("Some templates have issues - see above")
        return 0 if all_passed else 1

    except mysql.connector.Error as e:
        print("MySQL error: %s" % e)
        return 1
    except Exception as e:
        print("Error: %s" % e)
        return 1

if __name__ == '__main__':
    sys.exit(main())
