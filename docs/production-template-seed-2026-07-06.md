# Production Template Seed - 2026-07-06

## Issue

The production `templates` table was empty, so the public template library showed `0` available templates.

## Action

Seeded 7 enabled templates into production MySQL from local template JSON files.

## Verification

Endpoint:

```text
GET http://121.43.208.184/api/templates?page=1&limit=100&status=true&sortBy=recommended
```

Result:

```text
total = 7
```

Seeded templates:

- `全民简历-标准模板` / `classic` / `qm-blue-top-photo`
- `单栏-标准简历模板` / `classic` / `qm-classic-centered`
- `蓝色双列个人简历` / `sidebar` / `qm-sidebar-profile`
- `经典蓝色双列简历模板` / `sidebar` / `qm-sidebar-profile`
- `蓝色条带行政简历` / `compact` / `qm-ribbon-compact`
- `图片风格-蓝色横幅` / `spotlight` / `qm-spotlight-featured`
- `时间轴双列简历模板` / `timeline` / `qm-timeline-icons`

## Adversarial Notes

- Production compose does not currently auto-run template seed. A fresh production database can regress to an empty template library.
- Local `蓝色双列简历模板-修正版.json` is invalid JSON and was intentionally not seeded.
- Existing local seed path is `docker compose --profile seed run --rm seed-templates`; production deployment should either include an equivalent seed step or backend startup should auto-seed when `templates` is empty.
