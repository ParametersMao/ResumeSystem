<template>
  <div class="core-preview-shell">
    <div ref="sheetRef" class="resume-sheet" :class="sheetClasses" :style="sheetStyle">
      <header v-if="showCustomDocumentHeading" class="custom-document-heading">
        <h1 v-if="document.documentTitle">{{ document.documentTitle }}</h1>
        <p v-if="document.slogan">{{ document.slogan }}</p>
      </header>
      <template v-if="layoutKey === 'qm-blue-top-photo'">
        <header class="qm-blue-header">
          <div class="qm-blue-titlebar">PERSONAL RESUME</div>
          <div class="qm-blue-identity">
            <div class="qm-blue-name-group">
              <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
              <p class="resume-role">求职岗位：{{ document.profile.title || '前端工程师' }}</p>
            </div>
            <div class="qm-blue-meta">
              <span v-for="item in contactItems" :key="item.label">
                <strong>{{ item.label }}：</strong>{{ item.value }}
              </span>
            </div>
            <div v-if="profileAvatar" class="resume-avatar-wrap qm-blue-avatar-wrap">
              <img class="resume-avatar qm-blue-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
            </div>
          </div>
        </header>

        <section
          v-for="section in visibleSections"
          :key="section.id"
          class="resume-section qm-blue-section"
        >
          <div class="section-heading">
            <span class="section-heading-bar"></span>
            <h2>{{ section.title }}</h2>
          </div>

          <div v-if="section.type === 'skills'" class="skills-list">
            <span
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="skill-pill"
            >
              {{ item.name || item.text }}
            </span>
          </div>

          <div v-else-if="section.type === 'summary'" class="section-items">
            <p
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="item-description summary-block"
            >
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="section-items">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="section-item"
            >
              <div class="item-heading qm-blue-item-heading">
                <span class="qm-blue-date">{{ formatDuration(item.duration) || item.date }}</span>
                <h3>{{ getPrimaryText(section.type, item) }}</h3>
                <span v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</span>
              </div>
              <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="layoutKey === 'qm-sidebar-profile' || templateVariant === 'sidebar'">
        <div class="sidebar-layout">
          <aside class="sidebar-column">
            <div class="sidebar-identity">
              <img v-if="profileAvatar" class="resume-avatar sidebar-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
              <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
              <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
            </div>

            <section v-if="contactItems.length" class="sidebar-block">
              <h2>联系方式</h2>
              <div class="sidebar-meta-list">
                <span v-for="item in contactItems" :key="item.label">
                  <strong>{{ item.label }}：</strong>{{ item.value }}
                </span>
              </div>
            </section>

            <section v-if="skillsSection" class="sidebar-block">
              <h2>{{ skillsSection.title }}</h2>
              <div class="sidebar-skills-list">
                <div
                  v-for="(item, index) in skillsSection.items"
                  :key="`${skillsSection.id}-${index}`"
                  class="sidebar-skill-item"
                >
                  <div class="sidebar-skill-label">
                    <span>{{ item.name || item.text }}</span>
                    <em v-if="item.level">{{ item.level }}</em>
                  </div>
                  <div v-if="getSkillProficiency(item)" class="sidebar-skill-meter">
                    <span><i :style="{ width: `${getSkillProficiency(item)}%` }"></i></span>
                    <strong>{{ getSkillProficiency(item) }}%</strong>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <main class="sidebar-main">
            <section
              v-for="section in mainSections"
              :key="section.id"
              class="resume-section"
            >
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ section.title }}</h2>
              </div>

              <div v-if="section.type === 'summary'" class="section-items">
                <p
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="item-description summary-block"
                >
                  {{ getDescription(item) }}
                </p>
              </div>

              <div v-else class="section-items">
                <article
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="section-item"
                >
                  <div class="item-heading">
                    <h3>{{ getPrimaryText(section.type, item) }}</h3>
                    <span v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</span>
                  </div>
                  <div class="item-subheading">
                    <span>{{ formatDuration(item.duration) || item.date }}</span>
                  </div>
                  <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
                </article>
              </div>
            </section>
          </main>
        </div>
      </template>

      <template v-else-if="layoutKey === 'qm-classic-centered'">
        <header class="classic-centered-header">
          <div class="classic-centered-identity">
            <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
            <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
            <div class="classic-centered-meta">
              <span v-for="item in contactItems" :key="item.label">
                <strong>{{ item.label }}</strong>
                <em>{{ item.value }}</em>
              </span>
            </div>
          </div>
          <div v-if="profileAvatar" class="classic-centered-avatar-wrap">
            <img class="resume-avatar classic-centered-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
          </div>
        </header>

        <section
          v-for="section in visibleSections"
          :key="section.id"
          class="resume-section classic-centered-section"
        >
          <div class="section-heading">
            <span class="section-heading-bar"></span>
            <h2>{{ section.title }}</h2>
          </div>

          <div v-if="section.type === 'skills'" class="skills-list">
            <span
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="skill-pill"
            >
              {{ item.name || item.text }}
            </span>
          </div>

          <div v-else-if="section.type === 'summary'" class="section-items">
            <p
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="item-description summary-block"
            >
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="section-items">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="section-item"
            >
              <div class="item-heading classic-centered-item-heading">
                <span>{{ formatDuration(item.duration) || item.date }}</span>
                <h3>{{ getPrimaryText(section.type, item) }}</h3>
                <span v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</span>
              </div>
              <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="layoutKey === 'qm-timeline-icons' || templateVariant === 'timeline'">
        <header class="timeline-hero">
          <div class="timeline-hero-copy">
            <p class="eyebrow">CAREER STORY</p>
            <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
            <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
          </div>
          <div class="timeline-meta-panel">
            <img v-if="profileAvatar" class="resume-avatar timeline-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
            <div class="timeline-contact-grid">
              <span v-for="item in contactItems" :key="item.label">
                <strong>{{ item.label }}</strong>
                <em>{{ item.value }}</em>
              </span>
            </div>
          </div>
        </header>

        <section
          v-for="section in visibleSections"
          :key="section.id"
          class="timeline-section"
        >
          <div class="timeline-marker">
            <span class="timeline-dot"></span>
            <h2>{{ section.title }}</h2>
          </div>

          <div v-if="section.type === 'skills'" class="timeline-skills">
            <span
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="timeline-skill"
            >
              {{ item.name || item.text }}
            </span>
          </div>

          <div v-else-if="section.type === 'summary'" class="section-items">
            <p
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="item-description summary-block timeline-summary"
            >
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="timeline-list">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="timeline-card"
            >
              <div class="timeline-card-top">
                <div>
                  <h3>{{ getPrimaryText(section.type, item) }}</h3>
                  <p v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</p>
                </div>
                <span class="timeline-date">{{ formatDuration(item.duration) || item.date }}</span>
              </div>
              <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="templateVariant === 'spotlight'">
        <header class="spotlight-hero">
          <div class="spotlight-copy">
            <p class="spotlight-kicker">PRODUCT · GROWTH · OUTCOMES</p>
            <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
            <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
            <p v-if="summarySection?.items?.length" class="spotlight-summary">
              {{ getDescription(summarySection.items[0]) }}
            </p>
          </div>
          <div class="spotlight-meta-card">
            <img v-if="profileAvatar" class="resume-avatar spotlight-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
            <div v-for="item in contactItems" :key="item.label" class="spotlight-meta-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </header>

        <div class="spotlight-body">
          <aside class="spotlight-side">
            <section v-if="skillsSection" class="spotlight-panel">
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ skillsSection.title }}</h2>
              </div>
              <div class="spotlight-skill-grid">
                <span
                  v-for="(item, index) in skillsSection.items"
                  :key="`${skillsSection.id}-${index}`"
                  class="spotlight-skill"
                >
                  {{ item.name || item.text }}
                </span>
              </div>
            </section>

            <section
              v-for="section in supportSections"
              :key="section.id"
              class="spotlight-panel"
            >
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ section.title }}</h2>
              </div>

              <div v-if="section.type === 'summary'" class="section-items">
                <p
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="item-description summary-block"
                >
                  {{ getDescription(item) }}
                </p>
              </div>

              <div v-else class="section-items">
                <article
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="section-item compact-item"
                >
                  <div class="item-heading">
                    <h3>{{ getPrimaryText(section.type, item) }}</h3>
                  </div>
                  <div class="item-subheading">
                    <span>{{ getSecondaryText(section.type, item) }}</span>
                    <span>{{ formatDuration(item.duration) || item.date }}</span>
                  </div>
                  <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
                </article>
              </div>
            </section>
          </aside>

          <main class="spotlight-main">
            <section
              v-for="section in outcomeSections"
              :key="section.id"
              class="resume-section spotlight-section"
            >
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ section.title }}</h2>
              </div>

              <div class="section-items">
                <article
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="spotlight-card"
                >
                  <div class="spotlight-card-head">
                    <div>
                      <h3>{{ getPrimaryText(section.type, item) }}</h3>
                      <p v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</p>
                    </div>
                    <span class="spotlight-date">{{ formatDuration(item.duration) || item.date }}</span>
                  </div>
                  <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
                  <div v-if="extractOutcomeMetrics(getDescription(item)).length" class="outcome-metrics">
                    <span v-for="metric in extractOutcomeMetrics(getDescription(item))" :key="metric">{{ metric }}</span>
                  </div>
                </article>
              </div>
            </section>
          </main>
        </div>
      </template>

      <template v-else-if="layoutKey === 'qm-student-editorial'">
        <header class="student-resume-header">
          <div class="student-identity">
            <p class="student-eyebrow">CAMPUS RECRUITMENT</p>
            <h1>{{ document.profile.name || '李妍' }}</h1>
            <p class="student-target">{{ studentIntention || document.profile.title || '产品运营实习生' }}</p>
            <div class="student-contact-list">
              <span v-for="item in contactItems" :key="item.label">
                <strong>{{ item.label }}</strong>{{ item.value }}
              </span>
            </div>
          </div>
          <img
            v-if="document.profile.avatar?.trim() && document.profile.avatar !== DEFAULT_AVATAR_PLACEHOLDER"
            class="student-avatar"
            :class="avatarImgClass"
            :style="avatarStyle"
            :src="document.profile.avatar"
            alt="个人照片"
          />
        </header>

        <section v-if="studentEducationSection" class="student-education-spotlight">
          <div class="student-section-kicker">EDUCATION</div>
          <article
            v-for="(item, index) in studentEducationSection.items"
            :key="`${studentEducationSection.id}-${index}`"
            class="student-education-item"
          >
            <div>
              <h2>{{ item.school || '学校名称' }}</h2>
              <p>{{ item.degree || item.major || '专业与学历' }}</p>
            </div>
            <time>{{ formatDuration(item.duration) }}</time>
            <p v-if="getDescription(item)" class="student-description">{{ getDescription(item) }}</p>
          </article>
        </section>

        <section
          v-for="section in studentBodySections"
          :key="section.id"
          class="student-section"
          :class="`student-section-${section.type}`"
        >
          <header class="student-section-heading">
            <span>{{ getStudentSectionIndex(section.type) }}</span>
            <div>
              <p>{{ getStudentSectionEnglish(section.type) }}</p>
              <h2>{{ section.title }}</h2>
            </div>
          </header>

          <div v-if="section.type === 'skills'" class="student-skills-list">
            <span v-for="skill in getSkillLabels(section.items)" :key="skill">{{ skill }}</span>
          </div>

          <div v-else-if="section.type === 'summary'" class="student-summary">
            <p v-for="(item, index) in section.items" :key="`${section.id}-${index}`">
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="student-items">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="student-item"
            >
              <div class="student-item-header">
                <div>
                  <h3>{{ getPrimaryText(section.type, item) }}</h3>
                  <p v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</p>
                </div>
                <time v-if="formatDuration(item.duration) || item.date">
                  {{ formatDuration(item.duration) || item.date }}
                </time>
              </div>
              <p v-if="getDescription(item)" class="student-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="layoutKey === 'qm-asymmetric-profile'">
        <div class="asymmetric-layout">
          <aside class="asymmetric-left">
            <header class="asymmetric-identity">
              <p class="asymmetric-kicker">PERSONAL PROFILE</p>
              <h1>{{ document.profile.name || '张三' }}</h1>
              <p>{{ asymmetricIntention }}</p>
            </header>

            <section class="asymmetric-contact">
              <h2>基本信息</h2>
              <div>
                <span v-for="item in contactItems" :key="item.label">
                  <strong>{{ item.label }}</strong><em>{{ item.value }}</em>
                </span>
              </div>
            </section>

            <section
              v-for="section in asymmetricLeftSections"
              :key="section.id"
              class="asymmetric-section asymmetric-left-section"
            >
              <h2>{{ section.title }}</h2>
              <div v-if="section.type === 'skills'" class="asymmetric-skills">
                <div v-for="(item, index) in section.items" :key="`${section.id}-${index}`" class="asymmetric-skill">
                  <div><strong>{{ item.name || item.text }}</strong><em>{{ item.level || `${getSkillProficiency(item)}%` }}</em></div>
                  <span v-if="getSkillProficiency(item)"><i :style="{ width: `${getSkillProficiency(item)}%` }"></i></span>
                </div>
              </div>
              <div v-else class="asymmetric-compact-items">
                <article v-for="(item, index) in section.items" :key="`${section.id}-${index}`">
                  <strong>{{ getPrimaryText(section.type, item) }}</strong>
                  <span>{{ getSecondaryText(section.type, item) }}</span>
                  <time>{{ formatDuration(item.duration) || item.date }}</time>
                  <p v-if="getDescription(item)">{{ getDescription(item) }}</p>
                </article>
              </div>
            </section>
          </aside>

          <main class="asymmetric-right">
            <header class="asymmetric-anchor">
              <img v-if="profileAvatar" class="asymmetric-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
              <div>
                <p>PROFILE / 个人陈述</p>
                <h2>{{ document.documentTitle || document.profile.title || '职业简历' }}</h2>
                <blockquote>{{ asymmetricSummary }}</blockquote>
                <span v-if="document.slogan">{{ document.slogan }}</span>
              </div>
            </header>

            <section
              v-for="section in asymmetricRightSections"
              :key="section.id"
              class="asymmetric-section asymmetric-story-section"
            >
              <header><span></span><h2>{{ section.title }}</h2></header>
              <article v-for="(item, index) in section.items" :key="`${section.id}-${index}`">
                <div class="asymmetric-story-head">
                  <div><h3>{{ getPrimaryText(section.type, item) }}</h3><p>{{ getSecondaryText(section.type, item) }}</p></div>
                  <time>{{ formatDuration(item.duration) || item.date }}</time>
                </div>
                <p v-if="getDescription(item)" class="asymmetric-description">{{ getDescription(item) }}</p>
              </article>
            </section>
          </main>
        </div>
      </template>

      <template v-else-if="layoutKey === 'qm-table-formal'">
        <div class="formal-table-title">
          <p>CURRICULUM VITAE</p>
          <h1>{{ document.documentTitle || '个人简历' }}</h1>
          <span v-if="document.slogan">{{ document.slogan }}</span>
        </div>

        <table class="formal-profile-table">
          <colgroup>
            <col class="formal-label-column" />
            <col />
            <col class="formal-label-column" />
            <col />
            <col class="formal-photo-column" />
          </colgroup>
          <tbody>
            <tr>
              <th>姓名</th><td>{{ document.profile.name || '张三' }}</td>
              <th>求职岗位</th><td>{{ document.profile.title || '目标岗位' }}</td>
              <td class="formal-profile-photo" rowspan="3">
                <img v-if="profileAvatar" class="resume-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
                <span v-else>照片</span>
              </td>
            </tr>
            <tr>
              <th>年龄</th><td>{{ document.profile.age || '待填写' }}</td>
              <th>性别</th><td>{{ document.profile.gender || '待填写' }}</td>
            </tr>
            <tr>
              <th>工作经验</th><td>{{ document.profile.yearsOfExperience || '待填写' }}</td>
              <th>联系电话</th><td>{{ document.profile.phone || '待填写' }}</td>
            </tr>
            <tr>
              <th>联系邮箱</th><td colspan="4">{{ document.profile.email || '待填写' }}</td>
            </tr>
            <tr class="formal-intention-row">
              <th>求职意向</th><td colspan="4">{{ formalIntention }}</td>
            </tr>
          </tbody>
        </table>

        <section v-for="section in formalSections" :key="section.id" class="formal-table-section">
          <header>{{ section.title }}</header>
          <div v-if="section.type === 'skills'" class="formal-table-skills">
            <span v-for="skill in getSkillLabels(section.items)" :key="skill">{{ skill }}</span>
          </div>
          <div v-else-if="section.type === 'summary'" class="formal-table-summary">
            <p v-for="(item, index) in section.items" :key="`${section.id}-${index}`">{{ getDescription(item) }}</p>
          </div>
          <div v-else class="formal-table-items">
            <article v-for="(item, index) in section.items" :key="`${section.id}-${index}`">
              <div class="formal-item-meta">
                <time>{{ formatDuration(item.duration) || item.date || '—' }}</time>
                <strong>{{ getPrimaryText(section.type, item) }}</strong>
                <span>{{ getSecondaryText(section.type, item) }}</span>
              </div>
              <p v-if="getDescription(item)">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="layoutKey === 'qm-minimal-ats'">
        <header class="ats-resume-header" :class="{ 'has-avatar': profileAvatar }">
          <div class="ats-identity">
            <h1>{{ document.profile.name || '张三' }}</h1>
            <p>{{ document.profile.title || '前端工程师' }}</p>
          </div>
          <div class="ats-contact-list">
            <span v-for="item in contactItems" :key="item.label">
              <strong>{{ item.label }}</strong>
              <em>{{ item.value }}</em>
            </span>
          </div>
          <div v-if="profileAvatar" class="ats-avatar-wrap">
            <img
              class="resume-avatar ats-avatar"
              :class="avatarImgClass"
              :style="avatarStyle"
              :src="profileAvatar"
              alt="个人照片"
            />
          </div>
        </header>

        <section
          v-for="section in atsSections"
          :key="section.id"
          class="ats-section"
          :class="`ats-section-${section.type}`"
        >
          <div class="ats-section-title">
            <h2>{{ section.title }}</h2>
          </div>

          <div v-if="section.type === 'skills'" class="ats-skills-list">
            <span v-for="skill in getSkillLabels(section.items)" :key="skill">{{ skill }}</span>
          </div>

          <div v-else-if="section.type === 'summary'" class="ats-summary">
            <p v-for="(item, index) in section.items" :key="`${section.id}-${index}`">
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="ats-items">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="ats-item"
            >
              <div class="ats-item-header">
                <div>
                  <h3>{{ getAtsTitle(section.type, item) }}</h3>
                  <p v-if="getAtsOrganization(section.type, item)">{{ getAtsOrganization(section.type, item) }}</p>
                </div>
                <time v-if="formatDuration(item.duration) || item.date">
                  {{ formatDuration(item.duration) || item.date }}
                </time>
              </div>
              <p v-if="getDescription(item)" class="ats-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>

      <template v-else>
        <header class="resume-header">
          <div v-if="profileAvatar" class="resume-avatar-wrap">
            <img class="resume-avatar" :class="avatarImgClass" :style="avatarStyle" :src="profileAvatar" alt="个人照片" />
          </div>
          <div class="resume-identity">
            <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
            <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
          </div>
          <div class="resume-header-side">
            <div class="resume-meta">
              <span v-for="item in contactItems" :key="item.label">
                <strong>{{ item.label }}：</strong>{{ item.value }}
              </span>
            </div>
          </div>
        </header>

        <section
          v-for="section in visibleSections"
          :key="section.id"
          class="resume-section"
        >
          <div class="section-heading">
            <span class="section-heading-bar"></span>
            <h2>{{ section.title }}</h2>
          </div>

          <div v-if="section.type === 'skills'" class="skills-list">
            <span
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="skill-pill"
            >
              {{ item.name || item.text }}
            </span>
          </div>

          <div v-else-if="section.type === 'summary'" class="section-items">
            <p
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="item-description summary-block"
            >
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="section-items">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="section-item"
            >
              <div class="item-heading">
                <h3>{{ getPrimaryText(section.type, item) }}</h3>
                <span v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</span>
              </div>
              <div class="item-subheading">
                <span>{{ formatDuration(item.duration) || item.date }}</span>
              </div>
              <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DEFAULT_AVATAR_PLACEHOLDER, type CoreAvatarLayout, type CoreResumeDocument, type CoreResumeSectionItem, type CoreSectionType } from '@/core-resume/model'
import { resolveResumeProfilePhoto } from '@/core-resume/photo'
import { resolveTemplateLayoutKey, resolveTemplateVariant } from '@/core-resume/templates'

interface ContactItem {
  label: string
  value: string
}

interface Props {
  document: CoreResumeDocument
}

const props = defineProps<Props>()

const sheetRef = ref<HTMLElement | null>(null)

const avatarConfig = computed<CoreAvatarLayout>(() => props.document.templateLayout?.avatar || {})
const profileAvatar = computed(() => {
  if (avatarConfig.value.enabled === false || avatarConfig.value.placement === 'hidden') {
    return ''
  }
  return resolveResumeProfilePhoto(props.document.profile) || DEFAULT_AVATAR_PLACEHOLDER
})
const isAvatarPlaceholder = computed(() => !resolveResumeProfilePhoto(props.document.profile))
const avatarClass = computed(() => `avatar-shape-${avatarConfig.value.shape || 'rounded'}`)
const avatarImgClass = computed(() => [avatarClass.value, { 'avatar-placeholder': isAvatarPlaceholder.value }])
const avatarStyle = computed(() => {
  const style: Record<string, string> = {}
  if (avatarConfig.value.width) {
    style.width = `${avatarConfig.value.width}px`
  }
  if (avatarConfig.value.height) {
    style.height = `${avatarConfig.value.height}px`
  }
  return style
})

const contactItems = computed<ContactItem[]>(() => {
  const profile = props.document.profile
  return [
    { label: '电话', value: profile.phone },
    { label: '邮箱', value: profile.email },
    { label: '性别', value: profile.gender },
    { label: '年龄', value: profile.age },
    { label: '经验', value: profile.yearsOfExperience },
    { label: '主页', value: profile.site },
  ].filter((item) => item.value)
})

const templateVariant = computed(() =>
  resolveTemplateVariant(props.document as unknown as { templateVariant?: unknown; templateName?: unknown; templateLayout?: { key?: unknown } }),
)
const layoutKey = computed(() =>
  props.document.templateLayout?.key ||
  resolveTemplateLayoutKey(props.document as unknown as { templateVariant?: unknown; templateName?: unknown; templateLayout?: { key?: unknown } }),
)
const sheetClasses = computed(() => [
  `variant-${templateVariant.value}`,
  `layout-${layoutKey.value}`,
  { 'has-custom-page-margin': props.document.themeOverrides?.pageMargin !== undefined },
])
const visibleSections = computed(() => props.document.sections.filter((section) => section.visible))
const skillsSection = computed(() => visibleSections.value.find((section) => section.type === 'skills'))
const summarySection = computed(() => visibleSections.value.find((section) => section.type === 'summary'))
const mainSections = computed(() => visibleSections.value.filter((section) => section.type !== 'skills'))
const featuredSections = computed(() =>
  visibleSections.value.filter((section) => ['experience', 'projects', 'internship'].includes(section.type)),
)
const OUTCOME_SECTION_ORDER: CoreSectionType[] = ['projects', 'experience', 'internship']
const outcomeSections = computed(() =>
  [...featuredSections.value].sort((left, right) =>
    OUTCOME_SECTION_ORDER.indexOf(left.type) - OUTCOME_SECTION_ORDER.indexOf(right.type),
  ),
)
const supportSections = computed(() =>
  visibleSections.value.filter((section) => !['experience', 'projects', 'internship', 'skills', 'summary'].includes(section.type)),
)
const ATS_SECTION_ORDER: CoreSectionType[] = [
  'summary',
  'skills',
  'experience',
  'internship',
  'projects',
  'education',
  'awards',
  'campus',
  'intention',
  'custom',
  'hobbies',
]
const atsSections = computed(() =>
  [...visibleSections.value].sort((left, right) =>
    ATS_SECTION_ORDER.indexOf(left.type) - ATS_SECTION_ORDER.indexOf(right.type),
  ),
)
const STUDENT_SECTION_ORDER: CoreSectionType[] = [
  'education',
  'projects',
  'internship',
  'campus',
  'skills',
  'awards',
  'summary',
  'experience',
  'custom',
  'hobbies',
  'intention',
]
const studentSections = computed(() =>
  [...visibleSections.value].sort((left, right) =>
    STUDENT_SECTION_ORDER.indexOf(left.type) - STUDENT_SECTION_ORDER.indexOf(right.type),
  ),
)
const studentEducationSection = computed(() =>
  studentSections.value.find((section) => section.type === 'education'),
)
const studentBodySections = computed(() =>
  studentSections.value.filter((section) => !['education', 'intention'].includes(section.type)),
)
const studentIntention = computed(() => {
  const section = studentSections.value.find((item) => item.type === 'intention')
  return String(section?.items[0]?.intention || '').trim()
})
const formalIntention = computed(() => {
  const section = visibleSections.value.find((item) => item.type === 'intention')
  return String(section?.items[0]?.intention || props.document.profile.title || '目标岗位').trim()
})
const formalSections = computed(() => visibleSections.value.filter((section) => section.type !== 'intention'))
const asymmetricIntention = computed(() => {
  const section = visibleSections.value.find((item) => item.type === 'intention')
  return String(section?.items[0]?.intention || props.document.profile.title || '目标岗位').trim()
})
const asymmetricSummary = computed(() => {
  const text = summarySection.value?.items.map((item) => getDescription(item)).filter(Boolean).join('\n')
  return text || '用清晰的经历与可验证成果说明专业能力。'
})
const asymmetricLeftSections = computed(() =>
  visibleSections.value.filter((section) => ['education', 'skills', 'awards'].includes(section.type)),
)
const asymmetricRightSections = computed(() =>
  visibleSections.value.filter((section) => ['experience', 'internship', 'projects', 'campus', 'custom', 'hobbies'].includes(section.type)),
)
const showCustomDocumentHeading = computed(() =>
  !['qm-table-formal', 'qm-asymmetric-profile'].includes(layoutKey.value) && Boolean(props.document.documentTitle || props.document.slogan),
)

const sheetStyle = computed(() => {
  const theme = props.document.theme
  return {
    '--resume-primary': theme.primaryColor,
    '--resume-font': theme.fontFamily,
    '--resume-heading-font': theme.headingFontFamily,
    '--resume-section-spacing': `${theme.sectionSpacing}px`,
    '--resume-item-spacing': `${theme.itemSpacing}px`,
    '--resume-font-size': `${theme.fontSize}px`,
    '--resume-line-height': String(theme.lineHeight),
    '--resume-page-margin': `${theme.pageMargin}px`,
  }
})

function getPrimaryText(type: CoreSectionType, item: CoreResumeSectionItem) {
  switch (type) {
    case 'intention':
      return String(item.intention || props.document.profile.title || '求职意向')
    case 'education':
      return String(item.school || '学校名称')
    case 'experience':
    case 'internship':
      return String(item.company || '公司名称')
    case 'projects':
      return String(item.name || '项目名称')
    case 'campus':
      return String(item.org || '校园组织')
    case 'skills':
      return String(item.name || '')
    case 'awards':
      return String(item.name || '奖项名称')
    case 'summary':
      return '个人简介'
    case 'hobbies':
      return String(item.text || '兴趣爱好')
    case 'custom':
      return String(item.name || '自定义模块')
    default:
      return ''
  }
}

function getSecondaryText(type: CoreSectionType, item: CoreResumeSectionItem) {
  switch (type) {
    case 'education':
      return String(item.degree || item.major || '')
    case 'experience':
    case 'internship':
    case 'projects':
    case 'campus':
      return String(item.role || '')
    case 'awards':
      return String(item.org || '')
    default:
      return ''
  }
}

function getDescription(item: CoreResumeSectionItem) {
  return String(item.desc || item.text || '')
}

function getAtsTitle(type: CoreSectionType, item: CoreResumeSectionItem) {
  switch (type) {
    case 'education':
      return String(item.degree || item.major || item.school || '教育经历')
    case 'experience':
    case 'internship':
      return String(item.role || item.company || '工作经历')
    case 'projects':
      return String(item.name || '项目经历')
    case 'campus':
      return String(item.role || item.org || '校园经历')
    default:
      return getPrimaryText(type, item)
  }
}

function getAtsOrganization(type: CoreSectionType, item: CoreResumeSectionItem) {
  switch (type) {
    case 'education':
      return String(item.school || '')
    case 'experience':
    case 'internship':
      return String(item.company || '')
    case 'projects':
      return String(item.role || '')
    case 'campus':
      return String(item.org || '')
    case 'awards':
      return String(item.org || '')
    default:
      return getSecondaryText(type, item)
  }
}

function getSkillLabels(items: CoreResumeSectionItem[]) {
  return items.map((item) => String(item.name || item.text || '').trim()).filter(Boolean)
}

function getSkillProficiency(item: CoreResumeSectionItem) {
  const raw = String(item.proficiency || '').replace('%', '').trim()
  const value = Number(raw)
  return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0
}

function extractOutcomeMetrics(text: string) {
  return [...new Set(text.match(/(?:\d+(?:\.\d+)?%|\d+(?:\.\d+)?[万千百亿]?\+?|Top\s?\d+|第\s?\d+\s?名)/gi) || [])].slice(0, 4)
}

function getStudentSectionIndex(type: CoreSectionType) {
  const index = STUDENT_SECTION_ORDER.indexOf(type)
  return String(Math.max(index, 0)).padStart(2, '0')
}

function getStudentSectionEnglish(type: CoreSectionType) {
  const labels: Partial<Record<CoreSectionType, string>> = {
    projects: 'SELECTED PROJECTS',
    internship: 'INTERNSHIP',
    campus: 'CAMPUS EXPERIENCE',
    skills: 'SKILLS & TOOLS',
    awards: 'AWARDS',
    summary: 'PROFILE',
    experience: 'EXPERIENCE',
    custom: 'ADDITIONAL',
    hobbies: 'INTERESTS',
  }
  return labels[type] || 'EXPERIENCE'
}

function formatDuration(value: unknown) {
  if (!value || typeof value !== 'object') {
    return ''
  }
  const duration = value as { start?: string; end?: string }
  return [duration.start, duration.end].filter(Boolean).join(' - ')
}

defineExpose({
  sheetRef,
})
</script>

<style scoped>
.core-preview-shell {
  padding: 28px;
  min-height: 100%;
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.06), transparent 25%),
    #eef2ff;
}

.resume-sheet {
  width: min(100%, 820px);
  min-height: 1120px;
  margin: 0 auto;
  padding: 42px 46px;
  background: #fff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
  border-radius: 24px;
  font-family: var(--resume-font);
  font-size: var(--resume-font-size);
  line-height: var(--resume-line-height);
  color: #0f172a;
}

.resume-sheet.has-custom-page-margin:not(.variant-sidebar) {
  padding: var(--resume-page-margin);
}

.resume-sheet.has-custom-page-margin.variant-sidebar .sidebar-column {
  padding-left: min(var(--resume-page-margin), 32px);
  padding-right: min(var(--resume-page-margin), 32px);
}

.resume-sheet.has-custom-page-margin.variant-sidebar .sidebar-main {
  padding-left: var(--resume-page-margin);
  padding-right: var(--resume-page-margin);
}

.custom-document-heading {
  margin: 0 0 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--resume-primary) 45%, #d7dee8);
  text-align: center;
}

.custom-document-heading h1 {
  margin: 0;
  color: var(--resume-primary);
  font-family: var(--resume-heading-font);
  font-size: 27px;
  letter-spacing: .12em;
}

.custom-document-heading p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 12px;
  letter-spacing: .08em;
}

.resume-sheet.variant-sidebar,
.resume-sheet.variant-timeline,
.resume-sheet.variant-spotlight {
  overflow: hidden;
}

.resume-sheet.variant-sidebar {
  padding: 0;
}

.resume-sheet.variant-timeline {
  padding: 34px 38px 42px;
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0)) #ffffff;
}

.resume-sheet.variant-spotlight {
  padding: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0)) #fff;
}

.resume-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.8fr) auto;
  grid-template-areas: "identity meta avatar";
  align-items: start;
  gap: 24px;
  padding-bottom: 24px;
  margin-bottom: var(--resume-section-spacing);
  border-bottom: 2px solid rgba(37, 99, 235, 0.16);
}

.resume-identity {
  grid-area: identity;
  min-width: 0;
}

.resume-header-side {
  grid-area: meta;
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.resume-avatar-wrap {
  grid-area: avatar;
  display: flex;
  justify-content: flex-end;
}

.resume-avatar {
  width: 86px;
  height: 108px;
  flex: 0 0 auto;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  background: #fff;
}

.resume-avatar.avatar-placeholder {
  opacity: 0.9;
}

.avatar-shape-circle {
  border-radius: 999px;
}

.avatar-shape-square {
  border-radius: 6px;
}

.avatar-shape-rounded {
  border-radius: 18px;
}

.sidebar-avatar {
  width: 96px;
  height: 120px;
  margin-bottom: 18px;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
}

.timeline-avatar {
  justify-self: end;
}

.spotlight-avatar {
  justify-self: center;
  width: 96px;
  height: 120px;
}

.resume-name {
  margin: 0 0 8px;
  font-size: 34px;
  line-height: 1.1;
  font-family: var(--resume-heading-font);
}

.resume-role {
  margin: 0;
  font-size: 16px;
  color: var(--resume-primary);
  font-weight: 600;
}

.resume-meta,
.sidebar-meta-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #475569;
}

.resume-meta {
  min-width: 220px;
}

.sidebar-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-height: 1120px;
}

.sidebar-column {
  padding: 42px 26px;
  background: linear-gradient(180deg, var(--resume-primary), color-mix(in srgb, var(--resume-primary) 72%, #0f172a));
  color: #eff6ff;
}

.sidebar-identity {
  margin-bottom: 28px;
}

.sidebar-column .resume-role {
  color: rgba(255, 255, 255, 0.92);
}

.sidebar-block + .sidebar-block {
  margin-top: 24px;
}

.sidebar-block h2 {
  margin: 0 0 12px;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.78);
}

.sidebar-main {
  padding: 42px 34px;
}

.timeline-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 24px;
  padding-bottom: 26px;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.timeline-hero-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--resume-primary);
  font-weight: 700;
}

.timeline-contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.timeline-meta-panel {
  display: grid;
  gap: 14px;
  justify-items: stretch;
}

.timeline-contact-grid span {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(37, 99, 235, 0.06);
}

.timeline-contact-grid strong {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #475569;
}

.timeline-contact-grid em {
  font-style: normal;
  color: #0f172a;
}

.timeline-section {
  position: relative;
  padding-left: 34px;
}

.timeline-section + .timeline-section {
  margin-top: calc(var(--resume-section-spacing) + 6px);
}

.timeline-section::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 12px;
  bottom: -18px;
  width: 2px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.34), rgba(37, 99, 235, 0.08));
}

.timeline-section:last-child::before {
  bottom: 18px;
}

.timeline-marker {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.timeline-dot {
  position: absolute;
  left: -34px;
  top: 4px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 5px solid rgba(37, 99, 235, 0.12);
  background: var(--resume-primary);
  box-sizing: border-box;
}

.timeline-marker h2 {
  margin: 0;
  font-size: 19px;
  font-family: var(--resume-heading-font);
}

.timeline-list {
  display: grid;
  gap: 14px;
}

.timeline-card {
  padding: 18px 20px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.timeline-card-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.timeline-card-top h3 {
  margin: 0;
  font-size: 16px;
}

.timeline-card-top p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 13px;
}

.timeline-date {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: var(--resume-primary);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.timeline-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.timeline-skill {
  display: inline-flex;
  align-items: center;
  padding: 9px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
  font-weight: 600;
}

.timeline-summary {
  border-left: 4px solid rgba(37, 99, 235, 0.18);
  background: rgba(248, 250, 252, 0.92);
}

.spotlight-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) 280px;
  gap: 20px;
  padding: 34px 42px 24px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--resume-primary) 28%, #ffffff), transparent 42%),
    linear-gradient(135deg, color-mix(in srgb, var(--resume-primary) 12%, #ffffff), #ffffff 68%);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.spotlight-kicker {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--resume-primary);
  font-weight: 700;
}

.spotlight-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spotlight-summary {
  margin: 8px 0 0;
  max-width: 560px;
  color: #334155;
}

.spotlight-meta-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.spotlight-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spotlight-meta-item span {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #64748b;
}

.spotlight-meta-item strong {
  color: #0f172a;
}

.spotlight-body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
}

.spotlight-side {
  padding: 26px 24px 30px;
  background: #f8fafc;
  border-right: 1px solid rgba(148, 163, 184, 0.14);
}

.spotlight-main {
  padding: 26px 30px 32px;
}

.spotlight-panel + .spotlight-panel,
.spotlight-section + .spotlight-section {
  margin-top: 20px;
}

.spotlight-skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spotlight-skill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.08);
  color: var(--resume-primary);
  font-weight: 600;
}

.compact-item {
  padding: 14px 16px;
}

.spotlight-card {
  padding: 17px 20px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.spotlight-card-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.spotlight-card-head h3 {
  margin: 0;
  font-size: 17px;
}

.spotlight-card-head p {
  margin: 6px 0 0;
  color: #475569;
}

.outcome-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.outcome-metrics span {
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--resume-primary);
  font-size: 11px;
  font-weight: 800;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.14);
}

.spotlight-date {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  color: var(--resume-primary);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.resume-section + .resume-section {
  margin-top: var(--resume-section-spacing);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.section-heading-bar {
  width: 8px;
  height: 22px;
  border-radius: 999px;
  background: var(--resume-primary);
}

.section-heading h2 {
  margin: 0;
  font-size: 18px;
  font-family: var(--resume-heading-font);
}

.section-items {
  display: flex;
  flex-direction: column;
  gap: var(--resume-item-spacing);
}

.section-item,
.summary-block {
  padding: 16px 18px;
  border-radius: 16px;
  background: #f8fafc;
}

.variant-sidebar .section-item,
.variant-sidebar .summary-block {
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.item-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.item-heading h3 {
  margin: 0;
  font-size: 15px;
}

.item-heading span {
  color: #475569;
  font-size: 13px;
}

.item-subheading {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}

.item-description {
  margin: 10px 0 0;
  color: #334155;
  white-space: pre-wrap;
}

.summary-block {
  margin: 0;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--resume-primary);
  font-weight: 600;
}

.variant-sidebar .skill-pill {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.variant-classic {
  position: relative;
  padding-top: 74px;
  border-radius: 8px;
}

.variant-classic::before {
  content: "PERSONAL RESUME";
  position: absolute;
  top: 18px;
  left: 32px;
  right: 32px;
  height: 46px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  background: var(--resume-primary);
  color: #fff;
  font-family: var(--resume-heading-font);
  font-size: 28px;
  font-weight: 600;
}

.variant-classic .resume-header {
  grid-template-columns: minmax(0, 1fr) minmax(360px, 1fr) 116px;
  border-bottom: 1px solid #cbd5e1;
}

.variant-classic .resume-name {
  display: inline-block;
  padding-bottom: 6px;
  border-bottom: 4px solid var(--resume-primary);
  color: var(--resume-primary);
}

.variant-classic .resume-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
}

.variant-classic .resume-avatar {
  width: 102px;
  height: 126px;
  border-radius: 4px;
  box-shadow: none;
}

.variant-ats {
  padding: 34px 42px;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

.variant-ats .resume-header {
  position: relative;
  grid-template-columns: minmax(0, 1fr) 118px;
  grid-template-areas:
    "identity avatar"
    "meta avatar";
  border-bottom: 1px solid #111827;
  padding-bottom: 14px;
  margin-bottom: 18px;
  text-align: center;
}

.variant-ats .resume-name {
  font-size: 30px;
}

.variant-ats .resume-role {
  color: #111827;
}

.variant-ats .resume-meta {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  margin-top: 10px;
  color: #374151;
}

.variant-ats .resume-avatar {
  width: 96px;
  height: 116px;
  border-radius: 0;
  box-shadow: none;
}

.variant-ats .section-heading {
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 6px;
}

.variant-ats .section-heading-bar {
  display: none;
}

.variant-ats .section-item,
.variant-ats .summary-block {
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.variant-executive {
  padding: 46px 50px;
  background:
    linear-gradient(90deg, #111827 0 12px, transparent 12px),
    linear-gradient(180deg, rgba(146, 64, 14, 0.08), transparent 30%),
    #fffaf0;
  border-radius: 18px;
}

.variant-executive .resume-header {
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.85fr) 118px;
  border-bottom: 2px solid rgba(146, 64, 14, 0.26);
}

.variant-executive .resume-meta {
  gap: 6px;
}

.variant-executive .resume-avatar {
  width: 100px;
  height: 124px;
  border-radius: 6px;
  box-shadow: none;
}

.variant-executive .resume-name {
  font-size: 38px;
  letter-spacing: 0.02em;
}

.variant-executive .section-heading-bar {
  width: 26px;
  height: 3px;
  border-radius: 0;
}

.variant-executive .section-item,
.variant-executive .summary-block {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(146, 64, 14, 0.14);
}

.variant-compact {
  padding: 28px 34px;
  border-radius: 12px;
  font-size: calc(var(--resume-font-size) - 1px);
}

.variant-compact .resume-header {
  grid-template-columns: 132px minmax(0, 1fr) minmax(260px, 0.9fr);
  grid-template-areas: "avatar identity meta";
  align-items: center;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #94a3b8;
}

.variant-compact .resume-name {
  font-size: 28px;
}

.variant-compact .resume-section + .resume-section {
  margin-top: 14px;
}

.variant-compact .section-heading {
  margin-bottom: 8px;
}

.variant-compact .section-heading h2 {
  position: relative;
  padding: 5px 18px 5px 24px;
  background: color-mix(in srgb, var(--resume-primary) 84%, #0f172a);
  color: #fff;
  font-size: 15px;
}

.variant-compact .section-heading h2::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  border-top: 14px solid transparent;
  border-bottom: 14px solid transparent;
  border-left: 10px solid #fff;
}

.variant-compact .section-heading-bar {
  display: none;
}

.variant-compact .resume-avatar {
  width: 112px;
  height: 138px;
  border-radius: 0;
  box-shadow: none;
}

.variant-compact .section-items {
  gap: 8px;
}

.variant-compact .section-item,
.variant-compact .summary-block {
  padding: 10px 12px;
  border-radius: 10px;
}

.variant-editorial {
  padding: 0;
  border-radius: 28px;
  overflow: hidden;
}

.variant-editorial .resume-header {
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.74fr) 122px;
  margin: 0;
  padding: 40px 46px 32px;
  color: #fff;
  background:
    radial-gradient(circle at 84% 12%, rgba(255, 255, 255, 0.28), transparent 28%),
    linear-gradient(135deg, var(--resume-primary), #0f172a);
  border-bottom: 0;
}

.variant-editorial .resume-avatar {
  width: 104px;
  height: 130px;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: none;
}

.variant-editorial .resume-role,
.variant-editorial .resume-meta {
  color: rgba(255, 255, 255, 0.86);
}

.variant-editorial .resume-section {
  padding: 0 46px;
}

.variant-editorial .resume-section:first-of-type {
  padding-top: 34px;
}

.variant-editorial .resume-section:last-child {
  padding-bottom: 42px;
}

.variant-editorial .section-heading {
  align-items: flex-end;
}

.variant-editorial .section-heading-bar {
  width: 34px;
  height: 4px;
  border-radius: 0;
}

.variant-editorial .section-item,
.variant-editorial .summary-block {
  background: #fff;
  border: 1px solid rgba(225, 29, 72, 0.14);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

/* Reference-style resume templates: tuned for print-like layouts and avatar placement. */
.variant-classic,
.variant-sidebar,
.variant-ats,
.variant-executive,
.variant-compact {
  --resume-ink: #172033;
  --resume-muted: #536071;
  color: var(--resume-ink);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

.variant-classic {
  padding: 76px 32px 34px;
  border-radius: 0;
}

.variant-classic::before {
  top: 10px;
  left: 10px;
  right: 10px;
  height: 38px;
  padding: 0 26px;
  font-size: 25px;
  letter-spacing: 0.04em;
}

.variant-classic .resume-header {
  grid-template-columns: minmax(190px, 0.9fr) minmax(300px, 1fr) 128px;
  gap: 18px;
  padding: 0 10px 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #b8c0ca;
}

.variant-classic .resume-name {
  margin-bottom: 6px;
  padding-bottom: 8px;
  border-bottom-width: 4px;
  font-size: 28px;
}

.variant-classic .resume-role {
  color: var(--resume-primary);
  font-size: 15px;
}

.variant-classic .resume-meta {
  align-content: start;
  min-width: 0;
  font-size: 14px;
  color: #111827;
}

.variant-classic .resume-avatar-wrap {
  align-self: center;
}

.variant-classic .resume-avatar {
  width: 104px;
  height: 132px;
  border: 0;
  background: transparent;
  object-fit: contain;
}

.variant-classic .resume-section + .resume-section {
  margin-top: 24px;
}

.variant-classic .section-heading {
  gap: 0;
  align-items: flex-end;
  margin-bottom: 14px;
  border-bottom: 1px solid #8d96a3;
}

.variant-classic .section-heading h2 {
  padding: 0 12px 7px 0;
  border-bottom: 4px solid var(--resume-primary);
  color: var(--resume-primary);
  font-size: 19px;
}

.variant-classic .section-heading-bar {
  display: none;
}

.variant-classic .section-item,
.variant-classic .summary-block {
  padding: 0;
  border-radius: 0;
  background: transparent;
}

.variant-classic .item-heading h3,
.variant-classic .item-heading span {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.variant-classic .item-description {
  margin-top: 8px;
  color: #2f3a4a;
}

.resume-sheet.variant-sidebar {
  position: relative;
  width: min(100%, 820px);
  padding: 0;
  border-radius: 0;
  background: #fff;
}

.resume-sheet.variant-sidebar::before {
  content: "";
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  height: 22px;
  background:
    linear-gradient(90deg, #5a9cc9 0 61%, transparent 61% 90%, #5a9cc9 90%);
  z-index: 1;
}

.variant-sidebar .sidebar-layout {
  grid-template-columns: 28.66% minmax(0, 1fr);
  min-height: 1120px;
}

.variant-sidebar .sidebar-column {
  padding: 70px 26px 36px;
  background: #f0f0f0;
  color: var(--resume-ink);
}

.variant-sidebar .sidebar-identity {
  display: grid;
  justify-items: center;
  margin-bottom: 26px;
  text-align: center;
}

.variant-sidebar .sidebar-avatar {
  width: 122px;
  height: 154px;
  margin-bottom: 28px;
  border: 1px solid var(--resume-primary);
  border-radius: 0;
  box-shadow: none;
  object-fit: contain;
}

.variant-sidebar .sidebar-identity .resume-name {
  color: var(--resume-primary);
  font-size: 31px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.variant-sidebar .sidebar-column .resume-role {
  color: #111827;
  font-size: 14px;
}

.variant-sidebar .sidebar-block {
  padding-top: 20px;
  border-top: 1px solid #d8d8d8;
}

.variant-sidebar .sidebar-block h2 {
  width: 170px;
  margin: 0 auto 16px;
  padding: 8px 12px;
  border: 2px solid var(--resume-primary);
  color: #111827;
  text-align: center;
  font-size: 15px;
  letter-spacing: 0.12em;
}

.variant-sidebar .sidebar-meta-list,
.variant-sidebar .sidebar-skills-list {
  color: #111827;
  font-size: 14px;
}

.sidebar-skills-list {
  display: grid;
  gap: 15px;
}

.sidebar-skill-item {
  min-width: 0;
}

.sidebar-skill-label,
.sidebar-skill-meter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sidebar-skill-label span {
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 700;
}

.sidebar-skill-label em,
.sidebar-skill-meter strong {
  flex: 0 0 auto;
  color: #687386;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
}

.sidebar-skill-meter {
  margin-top: 6px;
}

.sidebar-skill-meter > span {
  position: relative;
  flex: 1;
  height: 5px;
  overflow: hidden;
  background: #d5d8dd;
}

.sidebar-skill-meter i {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--resume-primary);
}

.variant-sidebar .sidebar-main {
  padding: 66px 34px 36px;
}

.variant-sidebar .section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 0 0 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--resume-primary) 72%, #fff);
}

.variant-sidebar .section-heading-bar {
  position: static;
  flex: 0 0 4px;
  width: 4px;
  height: 19px;
  border-radius: 0;
  background: var(--resume-primary);
}

.variant-sidebar .section-heading h2 {
  color: var(--resume-primary);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: .08em;
}

.variant-sidebar .section-item,
.variant-sidebar .summary-block {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.variant-ats {
  padding: 34px 36px;
  border-radius: 0;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.variant-ats .resume-header {
  grid-template-columns: 132px minmax(0, 1fr) 132px;
  grid-template-areas: ". identity avatar" ". meta avatar";
  min-height: 132px;
  padding-bottom: 24px;
  margin-bottom: 20px;
  border-bottom: 0;
  text-align: center;
}

.variant-ats .resume-avatar-wrap {
  align-self: start;
  justify-content: center;
}

.variant-ats .resume-avatar {
  width: 96px;
  height: 120px;
  border: 0;
  object-fit: contain;
}

.variant-ats .resume-name {
  font-size: 30px;
  font-weight: 800;
}

.variant-ats .resume-role {
  color: #111827;
  font-weight: 600;
}

.variant-ats .resume-meta {
  max-width: 540px;
  min-width: 0;
  margin: 8px auto 0;
  justify-content: center;
  gap: 6px 14px;
  color: #111827;
}

.variant-ats .resume-meta span {
  display: inline-flex;
  gap: 4px;
}

.variant-ats .section-heading {
  margin-bottom: 16px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--resume-primary);
}

.variant-ats .section-heading h2 {
  color: #173e63;
  font-size: 20px;
}

.variant-ats .section-item,
.variant-ats .summary-block {
  padding: 0;
  border-radius: 0;
  background: transparent;
}

.variant-executive {
  padding: 38px 44px;
  border-radius: 0;
  background: #fff;
}

.variant-executive .resume-header {
  grid-template-columns: minmax(210px, 1fr) minmax(210px, 0.9fr) 132px;
  gap: 22px;
  min-height: 154px;
  padding-bottom: 30px;
  margin-bottom: 24px;
  border-bottom: 0;
}

.variant-executive .resume-name {
  font-size: 32px;
  letter-spacing: 0;
}

.variant-executive .resume-role {
  margin-top: 12px;
  color: #111827;
}

.variant-executive .resume-meta {
  min-width: 0;
  color: #111827;
  font-size: 14px;
}

.variant-executive .resume-avatar {
  width: 104px;
  height: 132px;
  border: 0;
  object-fit: contain;
}

.variant-executive .section-heading {
  position: relative;
  gap: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #27384f;
}

.variant-executive .section-heading-bar {
  width: 36px;
  height: 36px;
  margin-bottom: -1px;
  border-radius: 999px;
  background: #27384f;
}

.variant-executive .section-heading h2 {
  padding-bottom: 8px;
  color: #27384f;
  font-size: 20px;
}

.variant-executive .section-item,
.variant-executive .summary-block {
  padding: 0 0 0 18px;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.variant-compact {
  padding: 36px 34px 32px;
  border-radius: 0;
}

.variant-compact .resume-header {
  grid-template-columns: 150px minmax(0, 1fr);
  grid-template-areas:
    "avatar identity"
    "avatar meta";
  align-items: center;
  gap: 16px 34px;
  min-height: 150px;
  padding-bottom: 24px;
  border-bottom: 1px solid #a4aab3;
}

.variant-compact .resume-avatar-wrap {
  justify-content: center;
}

.variant-compact .resume-avatar {
  width: 122px;
  height: 150px;
  border: 0;
  object-fit: contain;
}

.variant-compact .resume-name {
  color: #173e63;
  font-size: 31px;
  letter-spacing: 0.08em;
}

.variant-compact .resume-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
  gap: 7px 44px;
  color: #111827;
}

.variant-compact .section-heading {
  position: relative;
  align-items: center;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #a4aab3;
}

.variant-compact .section-heading h2 {
  min-width: 98px;
  margin-bottom: -1px;
  padding: 6px 18px 6px 22px;
  background: #173e63;
  color: #fff;
  font-size: 17px;
  line-height: 1.15;
}

.variant-compact .section-heading h2::before {
  top: 0;
  border-top-width: 15px;
  border-bottom-width: 15px;
}

.variant-compact .section-item,
.variant-compact .summary-block {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.resume-sheet.layout-qm-blue-top-photo {
  padding: 12px 32px 32px;
  border-radius: 0;
  background: #fff;
  color: #111827;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.layout-qm-blue-top-photo .qm-blue-titlebar {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  margin-bottom: 28px;
  background: var(--resume-primary);
  color: #fff;
  font-family: var(--resume-heading-font);
  font-size: 25px;
  letter-spacing: 0.04em;
}

.layout-qm-blue-top-photo .qm-blue-identity {
  position: relative;
  min-height: 142px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 142px;
  gap: 24px;
  padding: 0 10px 18px;
  border-bottom: 1px solid #b8c0ca;
}

.layout-qm-blue-top-photo .qm-blue-name-group {
  display: flex;
  align-items: baseline;
  gap: 36px;
  min-width: 0;
}

.layout-qm-blue-top-photo .resume-name {
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 4px solid var(--resume-primary);
  color: var(--resume-primary);
  font-size: 30px;
  font-weight: 800;
  line-height: 1.18;
  white-space: nowrap;
}

.layout-qm-blue-top-photo .resume-role {
  margin: 0;
  color: var(--resume-primary);
  font-size: 15px;
  font-weight: 800;
}

.layout-qm-blue-top-photo .qm-blue-meta {
  grid-column: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px 52px;
  max-width: 560px;
  padding-top: 22px;
  color: #111827;
  font-size: 14px;
}

.layout-qm-blue-top-photo .qm-blue-meta span {
  min-width: 0;
}

.layout-qm-blue-top-photo .qm-blue-avatar-wrap {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: start;
  justify-content: center;
}

.layout-qm-blue-top-photo .qm-blue-avatar {
  width: 104px;
  height: 132px;
  border: 0;
  border-radius: 0;
  object-fit: contain;
  box-shadow: none;
}

.layout-qm-blue-top-photo .resume-section + .resume-section {
  margin-top: 18px;
}

.layout-qm-blue-top-photo .section-heading {
  gap: 0;
  align-items: flex-end;
  margin-bottom: 12px;
  border-bottom: 1px solid #8d96a3;
}

.layout-qm-blue-top-photo .section-heading h2 {
  padding: 0 12px 7px 0;
  border-bottom: 4px solid var(--resume-primary);
  color: var(--resume-primary);
  font-size: 20px;
}

.layout-qm-blue-top-photo .section-heading-bar {
  display: none;
}

.layout-qm-blue-top-photo .section-item,
.layout-qm-blue-top-photo .summary-block {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.layout-qm-blue-top-photo .qm-blue-item-heading {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) minmax(120px, auto);
  gap: 22px;
  align-items: baseline;
}

.layout-qm-blue-top-photo .qm-blue-date,
.layout-qm-blue-top-photo .item-heading h3,
.layout-qm-blue-top-photo .item-heading span {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.layout-qm-blue-top-photo .item-description {
  margin-top: 8px;
  color: #2f3a4a;
}

.resume-sheet.layout-qm-ribbon-compact {
  padding: 34px 34px 32px;
  border-radius: 0;
  background: #fff;
  color: #111827;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.layout-qm-ribbon-compact .resume-header {
  grid-template-columns: 142px minmax(0, 1fr);
  grid-template-areas:
    "avatar identity"
    "avatar meta";
  align-items: center;
  gap: 16px 34px;
  min-height: 154px;
  padding: 0 0 26px;
  margin-bottom: 22px;
  border-bottom: 1px solid #9aa3af;
}

.layout-qm-ribbon-compact .resume-avatar-wrap {
  justify-content: center;
}

.layout-qm-ribbon-compact .resume-avatar {
  width: 112px;
  height: 138px;
  border: 0;
  border-radius: 0;
  object-fit: contain;
  box-shadow: none;
}

.layout-qm-ribbon-compact .resume-name {
  color: #173e63;
  font-size: 32px;
  letter-spacing: 0.08em;
}

.layout-qm-ribbon-compact .resume-role {
  color: #111827;
  font-weight: 800;
}

.layout-qm-ribbon-compact .resume-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px 44px;
  min-width: 0;
  color: #111827;
}

.layout-qm-ribbon-compact .resume-section + .resume-section {
  margin-top: 22px;
}

.layout-qm-ribbon-compact .section-heading {
  position: relative;
  gap: 0;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 1px solid #9aa3af;
}

.layout-qm-ribbon-compact .section-heading h2 {
  min-width: 104px;
  margin-bottom: -1px;
  padding: 7px 18px 7px 26px;
  background: #173e63;
  color: #fff;
  font-size: 17px;
  line-height: 1.15;
}

.layout-qm-ribbon-compact .section-heading h2::before {
  top: 0;
  border-top-width: 16px;
  border-bottom-width: 16px;
}

.layout-qm-ribbon-compact .section-heading-bar {
  display: none;
}

.layout-qm-ribbon-compact .section-item,
.layout-qm-ribbon-compact .summary-block {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.resume-sheet.layout-qm-classic-centered {
  position: relative;
  padding: 42px 44px 38px;
  border-radius: 0;
  background: #ffffff;
  color: #111827;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

.resume-sheet.layout-qm-classic-centered::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #243b53;
}

.layout-qm-classic-centered .classic-centered-header {
  position: relative;
  min-height: 152px;
  padding: 8px 128px 26px;
  margin-bottom: 28px;
  border-bottom: 1px solid #243b53;
  text-align: center;
}

.layout-qm-classic-centered .resume-name {
  margin-bottom: 10px;
  color: #111827;
  font-size: 32px;
  letter-spacing: 0.08em;
}

.layout-qm-classic-centered .resume-role {
  color: #243b53;
  font-size: 15px;
}

.layout-qm-classic-centered .classic-centered-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px 14px;
  margin-top: 12px;
  color: #111827;
  font-size: 14px;
}

.layout-qm-classic-centered .classic-centered-meta span {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.layout-qm-classic-centered .classic-centered-meta strong {
  color: #243b53;
  white-space: nowrap;
}

.layout-qm-classic-centered .classic-centered-meta em {
  min-width: 0;
  color: #111827;
  font-style: normal;
  overflow-wrap: anywhere;
}

.layout-qm-classic-centered .classic-centered-avatar-wrap {
  position: absolute;
  top: 8px;
  right: 0;
}

.layout-qm-classic-centered .classic-centered-avatar {
  width: 92px;
  height: 116px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  object-fit: contain;
}

.layout-qm-classic-centered .classic-centered-section + .classic-centered-section {
  margin-top: 24px;
}

.layout-qm-classic-centered .section-heading {
  gap: 0;
  align-items: flex-end;
  margin-bottom: 14px;
  border-bottom: 1px solid #243b53;
}

.layout-qm-classic-centered .section-heading-bar {
  display: none;
}

.layout-qm-classic-centered .section-heading h2 {
  padding: 0 16px 7px 0;
  color: #243b53;
  font-size: 19px;
  border-bottom: 3px solid #243b53;
}

.layout-qm-classic-centered .section-item,
.layout-qm-classic-centered .summary-block {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.layout-qm-classic-centered .classic-centered-item-heading {
  display: grid;
  grid-template-columns: minmax(150px, 0.32fr) minmax(0, 1fr) minmax(120px, 0.28fr);
  gap: 18px;
  align-items: baseline;
}

.layout-qm-classic-centered .classic-centered-item-heading h3,
.layout-qm-classic-centered .classic-centered-item-heading span {
  color: #111827;
  font-size: 15px;
  font-weight: 800;
}

.layout-qm-classic-centered .skills-list {
  gap: 10px 42px;
}

.layout-qm-classic-centered .skill-pill {
  min-width: 160px;
  padding: 0 0 5px;
  border-radius: 0;
  border-bottom: 5px solid rgba(36, 59, 83, 0.24);
  background: transparent;
  color: #111827;
}

.resume-sheet.layout-qm-timeline-icons {
  padding: 0;
  border-radius: 0;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

.layout-qm-timeline-icons .timeline-hero {
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 34px;
  padding: 28px 40px 24px;
  margin: 0 0 26px;
  background: linear-gradient(90deg, #eef2f7 0 280px, #ffffff 280px);
  border-top: 12px solid #5a9dcc;
  border-bottom: 1px solid #d9e2ec;
}

.layout-qm-timeline-icons .timeline-hero-copy {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.layout-qm-timeline-icons .eyebrow {
  color: #5a9dcc;
}

.layout-qm-timeline-icons .resume-name {
  color: #5a9dcc;
  font-size: 34px;
  font-weight: 500;
}

.layout-qm-timeline-icons .resume-role {
  color: #1f2937;
}

.layout-qm-timeline-icons .timeline-meta-panel {
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
}

.layout-qm-timeline-icons .timeline-avatar {
  width: 112px;
  height: 132px;
  border-radius: 0;
  border: 1px solid #5a9dcc;
  box-shadow: none;
}

.layout-qm-timeline-icons .timeline-contact-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 18px;
}

.layout-qm-timeline-icons .timeline-contact-grid span {
  padding: 0;
  border-radius: 0;
  background: transparent;
  min-width: 0;
}

.layout-qm-timeline-icons .timeline-contact-grid strong {
  color: #5a9dcc;
}

.layout-qm-timeline-icons .timeline-contact-grid em {
  min-width: 0;
  overflow-wrap: anywhere;
}

.layout-qm-timeline-icons .timeline-section {
  margin: 0 40px;
  padding-left: 64px;
}

.layout-qm-timeline-icons .timeline-section + .timeline-section {
  margin-top: 20px;
}

.layout-qm-timeline-icons .timeline-section::before {
  left: 20px;
  top: 0;
  bottom: -20px;
  width: 3px;
  background: #5a9dcc;
}

.layout-qm-timeline-icons .timeline-marker {
  min-height: 38px;
  margin-bottom: 9px;
  border-bottom: 1px solid #c9d7e3;
}

.layout-qm-timeline-icons .timeline-dot {
  left: -55px;
  top: -2px;
  width: 38px;
  height: 38px;
  border: 0;
  background: #5a9dcc;
  box-shadow: inset 0 0 0 10px #ffffff;
}

.layout-qm-timeline-icons .timeline-marker h2 {
  color: #5a9dcc;
  font-size: 22px;
}

.layout-qm-timeline-icons .timeline-card {
  padding: 0 0 2px;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.layout-qm-timeline-icons .timeline-date {
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #5a9dcc;
}

.layout-qm-timeline-icons .timeline-skill {
  border-radius: 0;
  background: transparent;
  border-bottom: 4px solid rgba(90, 157, 204, 0.35);
}

.resume-sheet.layout-qm-table-formal {
  padding: 38px 42px 46px;
  border-radius: 0;
  background: #fff;
  color: #1f2937;
  box-shadow: 0 18px 40px rgba(15, 23, 42, .1);
  --formal-border: #8da0b4;
  --formal-fill: #edf3f8;
}

.resume-sheet.layout-qm-table-formal::before {
  display: none;
}

.formal-table-title {
  padding: 4px 0 19px;
  text-align: center;
}

.formal-table-title p {
  margin: 0 0 3px;
  color: #6b7c8f;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .28em;
}

.formal-table-title h1 {
  margin: 0;
  color: var(--resume-primary);
  font-family: var(--resume-heading-font);
  font-size: 29px;
  letter-spacing: .3em;
  text-indent: .3em;
}

.formal-table-title span {
  display: block;
  margin-top: 7px;
  color: #64748b;
  font-size: 11px;
  letter-spacing: .08em;
}

.formal-profile-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.formal-profile-table th,
.formal-profile-table td {
  height: 39px;
  padding: 7px 9px;
  border: 1px solid var(--formal-border);
  color: #334155;
  font-size: 11px;
  overflow-wrap: anywhere;
  vertical-align: middle;
}

.formal-profile-table th {
  color: #334155;
  background: var(--formal-fill);
  font-weight: 700;
  text-align: center;
}

.formal-label-column {
  width: 74px;
}

.formal-photo-column {
  width: 104px;
}

.formal-profile-photo {
  height: 117px;
  padding: 8px !important;
  color: #94a3b8;
  font-size: 11px;
  text-align: center;
}

.formal-profile-photo .resume-avatar {
  width: 78px;
  height: 98px;
  border: 0;
  border-radius: 0;
  object-fit: cover;
  box-shadow: none;
}

.formal-intention-row td {
  font-weight: 700;
  letter-spacing: .04em;
}

.formal-table-section {
  border: 1px solid var(--formal-border);
  border-top: 0;
  break-inside: avoid;
}

.formal-table-section > header {
  padding: 7px 13px;
  color: #20364d;
  background: var(--formal-fill);
  border-bottom: 1px solid var(--formal-border);
  font-family: var(--resume-heading-font);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .12em;
}

.formal-table-items article + article {
  border-top: 1px solid #bdc8d3;
}

.formal-table-items article {
  break-inside: avoid;
}

.formal-item-meta {
  display: grid;
  grid-template-columns: 122px minmax(0, 1fr) minmax(120px, .7fr);
  border-bottom: 1px dotted #c4ced8;
}

.formal-item-meta > * {
  min-width: 0;
  padding: 8px 11px;
  border-right: 1px solid #c4ced8;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.formal-item-meta > *:last-child {
  border-right: 0;
}

.formal-item-meta time {
  color: #526174;
  font-variant-numeric: tabular-nums;
}

.formal-table-items article > p,
.formal-table-summary p {
  margin: 0;
  padding: 9px 12px 11px;
  color: #3f4d60;
  font-size: 11px;
  line-height: 1.72;
  white-space: pre-line;
}

.formal-table-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  padding: 9px 12px;
}

.formal-table-skills span {
  padding: 3px 12px 3px 0;
  color: #334155;
  font-size: 11px;
  font-weight: 700;
}

.resume-sheet.layout-qm-asymmetric-profile {
  padding: 0;
  border-radius: 0;
  overflow: hidden;
  background: #fff;
  color: #24313a;
}

.asymmetric-layout {
  display: grid;
  grid-template-columns: 44% 56%;
  min-height: 1120px;
}

.asymmetric-left {
  padding: 58px 34px 44px;
  background: color-mix(in srgb, var(--resume-primary) 10%, #f6f2ea);
  border-right: 1px solid color-mix(in srgb, var(--resume-primary) 25%, #d9ddd9);
}

.asymmetric-right {
  padding: 52px 38px 44px;
}

.asymmetric-identity {
  padding-bottom: 24px;
  border-bottom: 3px solid var(--resume-primary);
}

.asymmetric-kicker,
.asymmetric-anchor > div > p {
  margin: 0 0 10px;
  color: var(--resume-primary);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .24em;
}

.asymmetric-identity h1 {
  margin: 0;
  color: #1f2b30;
  font-family: var(--resume-heading-font);
  font-size: 36px;
  letter-spacing: .12em;
}

.asymmetric-identity > p:last-child {
  margin: 10px 0 0;
  color: var(--resume-primary);
  font-size: 15px;
  font-weight: 700;
}

.asymmetric-contact,
.asymmetric-left-section {
  margin-top: var(--resume-section-spacing);
}

.asymmetric-contact h2,
.asymmetric-left-section > h2 {
  margin: 0 0 13px;
  padding-bottom: 7px;
  border-bottom: 1px solid color-mix(in srgb, var(--resume-primary) 42%, #cfd6d4);
  color: #26343b;
  font-size: 15px;
  letter-spacing: .1em;
}

.asymmetric-contact > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
}

.asymmetric-contact span {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.asymmetric-contact strong {
  color: #79868b;
  font-size: 9px;
  letter-spacing: .08em;
}

.asymmetric-contact em {
  min-width: 0;
  color: #24313a;
  font-size: 11px;
  font-style: normal;
  overflow-wrap: anywhere;
}

.asymmetric-compact-items,
.asymmetric-skills {
  display: grid;
  gap: var(--resume-item-spacing);
}

.asymmetric-compact-items article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 12px;
  break-inside: avoid;
}

.asymmetric-compact-items strong { font-size: 12px; }
.asymmetric-compact-items span,
.asymmetric-compact-items time { color: #657278; font-size: 10px; }
.asymmetric-compact-items time { text-align: right; }
.asymmetric-compact-items p { grid-column: 1 / -1; margin: 3px 0 0; font-size: 10px; white-space: pre-line; }

.asymmetric-skill > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.asymmetric-skill strong { font-size: 11px; }
.asymmetric-skill em { color: #657278; font-size: 9px; font-style: normal; }
.asymmetric-skill > span { display: block; height: 5px; background: rgba(71, 87, 91, .16); overflow: hidden; }
.asymmetric-skill i { display: block; height: 100%; background: var(--resume-primary); }

.asymmetric-anchor {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
  padding-bottom: 28px;
  margin-bottom: 30px;
  border-bottom: 1px solid color-mix(in srgb, var(--resume-primary) 42%, #d5dcde);
  break-inside: avoid;
}

.asymmetric-avatar {
  width: 112px;
  height: 142px;
  border: 0;
  border-radius: 0;
  object-fit: cover;
  background: #eef1f1;
}

.asymmetric-anchor h2 {
  margin: 0;
  color: #1f2b30;
  font-family: var(--resume-heading-font);
  font-size: 22px;
  line-height: 1.3;
}

.asymmetric-anchor blockquote {
  margin: 14px 0 0;
  color: #46565d;
  font-size: 11px;
  line-height: 1.8;
  white-space: pre-line;
}

.asymmetric-anchor > div > span {
  display: block;
  margin-top: 12px;
  color: var(--resume-primary);
  font-size: 10px;
  font-weight: 700;
}

.asymmetric-story-section + .asymmetric-story-section {
  margin-top: var(--resume-section-spacing);
}

.asymmetric-story-section > header {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 16px;
}

.asymmetric-story-section > header span {
  width: 18px;
  height: 3px;
  background: var(--resume-primary);
}

.asymmetric-story-section > header h2 {
  margin: 0;
  color: #26343b;
  font-size: 17px;
  letter-spacing: .08em;
}

.asymmetric-story-section article {
  padding-left: 27px;
  break-inside: avoid;
}

.asymmetric-story-section article + article {
  margin-top: var(--resume-item-spacing);
  padding-top: var(--resume-item-spacing);
  border-top: 1px dotted #c7d0d2;
}

.asymmetric-story-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.asymmetric-story-head h3 { margin: 0; color: #1f2b30; font-size: 13px; }
.asymmetric-story-head p { margin: 4px 0 0; color: var(--resume-primary); font-size: 10px; font-weight: 700; }
.asymmetric-story-head time { flex: 0 0 auto; color: #718087; font-size: 9px; }
.asymmetric-description { margin: 9px 0 0; color: #46565d; font-size: 10.5px; line-height: 1.75; white-space: pre-line; }

.resume-sheet.has-custom-page-margin.layout-qm-asymmetric-profile {
  padding: 0;
}

.resume-sheet.has-custom-page-margin.layout-qm-asymmetric-profile .asymmetric-left,
.resume-sheet.has-custom-page-margin.layout-qm-asymmetric-profile .asymmetric-right {
  padding-left: var(--resume-page-margin);
  padding-right: var(--resume-page-margin);
}

.formal-table-skills span + span::before {
  content: '·';
  padding-right: 12px;
  color: var(--resume-primary);
}

.resume-sheet.layout-qm-minimal-ats {
  padding: 42px 48px 46px;
  border-radius: 0;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
  color: #18212f;
  --ats-rule: #243b53;
  --ats-muted: #526071;
}

.ats-resume-header {
  display: grid;
  grid-template-columns: minmax(210px, .72fr) minmax(0, 1.28fr);
  gap: 28px;
  align-items: end;
  padding-bottom: 18px;
  margin-bottom: 26px;
  border-bottom: 2px solid var(--ats-rule);
}

.ats-resume-header.has-avatar {
  grid-template-columns: minmax(190px, .68fr) minmax(0, 1.32fr) auto;
  align-items: center;
}

.ats-avatar-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.ats-avatar {
  width: 72px;
  height: 88px;
  border: 1px solid #cbd5e1;
  border-radius: 2px;
  object-fit: cover;
  box-shadow: none;
}

.ats-identity h1 {
  margin: 0;
  color: #111827;
  font-family: var(--resume-heading-font);
  font-size: 34px;
  line-height: 1.08;
  letter-spacing: .04em;
}

.ats-identity p {
  margin: 8px 0 0;
  color: var(--ats-rule);
  font-size: 15px;
  font-weight: 800;
}

.ats-contact-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px 20px;
  align-content: end;
  font-size: 12px;
}

.ats-contact-list span {
  display: flex;
  min-width: 0;
  gap: 7px;
}

.ats-contact-list strong {
  flex: 0 0 auto;
  color: var(--ats-muted);
  font-size: 11px;
  letter-spacing: .04em;
}

.ats-contact-list em {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #18212f;
  font-style: normal;
}

.ats-section + .ats-section {
  margin-top: 22px;
}

.ats-section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 11px;
}

.ats-section-title::after {
  content: '';
  height: 1px;
  flex: 1;
  background: #aeb8c5;
}

.ats-section-title h2 {
  margin: 0;
  color: var(--ats-rule);
  font-family: var(--resume-heading-font);
  font-size: 15px;
  line-height: 1.2;
  letter-spacing: .08em;
  white-space: nowrap;
}

.ats-summary p,
.ats-description {
  margin: 0;
  color: #344154;
  white-space: pre-line;
}

.ats-items {
  display: grid;
  gap: 15px;
}

.ats-item {
  break-inside: avoid;
}

.ats-item-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: baseline;
}

.ats-item-header h3 {
  margin: 0;
  color: #111827;
  font-size: 14px;
  line-height: 1.35;
}

.ats-item-header p {
  margin: 3px 0 0;
  color: var(--ats-muted);
  font-size: 12px;
  font-weight: 700;
}

.ats-item-header time {
  color: var(--ats-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ats-description {
  margin-top: 7px;
  font-size: 12px;
  line-height: 1.7;
}

.ats-skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
  color: #18212f;
  font-size: 12px;
  font-weight: 700;
}

.ats-skills-list span + span::before {
  content: '·';
  margin: 0 10px;
  color: #7b8797;
}

.resume-sheet.layout-qm-executive-business {
  padding: 0;
  border-radius: 0;
  overflow: hidden;
  background: #fff;
  color: #101828;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

.layout-qm-executive-business .resume-header {
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.82fr) 132px;
  gap: 24px;
  min-height: 158px;
  padding: 32px 46px 28px;
  margin: 0 0 22px;
  color: #fff;
  background: linear-gradient(120deg, #26384f, #111827);
  border-bottom: 0;
}

.layout-qm-executive-business .resume-name {
  color: #fff;
  font-size: 35px;
  letter-spacing: 0.02em;
}

.layout-qm-executive-business .resume-role {
  width: fit-content;
  margin-top: 14px;
  padding-bottom: 7px;
  color: #f7e4b1;
  border-bottom: 3px solid #c8a96a;
}

.layout-qm-executive-business .resume-role,
.layout-qm-executive-business .resume-role * {
  color: #f7e4b1 !important;
}

.layout-qm-executive-business .resume-meta {
  min-width: 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
}

.layout-qm-executive-business .resume-meta span,
.layout-qm-executive-business .resume-meta strong {
  color: rgba(255, 255, 255, 0.92);
}

.layout-qm-executive-business .resume-meta strong {
  color: #f7e4b1;
}

.layout-qm-executive-business .resume-avatar {
  width: 104px;
  height: 132px;
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 6px;
  object-fit: contain;
  box-shadow: none;
}

.layout-qm-executive-business .resume-section {
  padding: 0 46px;
}

.layout-qm-executive-business .resume-section:last-child {
  padding-bottom: 29px;
}

.layout-qm-executive-business .resume-section + .resume-section {
  margin-top: 18px;
}

.layout-qm-executive-business .section-heading {
  gap: 14px;
  margin-bottom: 11px;
  border-bottom: 1px solid #27384f;
}

.layout-qm-executive-business .section-heading-bar {
  width: 38px;
  height: 4px;
  border-radius: 0;
  background: #c8a96a;
}

.layout-qm-executive-business .section-heading h2 {
  padding-bottom: 8px;
  color: #27384f;
  font-size: 20px;
}

.layout-qm-executive-business .section-item,
.layout-qm-executive-business .summary-block {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.resume-sheet.layout-qm-student-editorial {
  padding: 34px 48px 38px;
  border-radius: 0;
  overflow: hidden;
  background:
    linear-gradient(90deg, var(--resume-primary) 0 8px, transparent 8px),
    #fff;
  color: #172033;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.student-resume-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 30px;
  align-items: start;
  padding-bottom: 20px;
  border-bottom: 2px solid #172033;
}

.student-eyebrow {
  margin: 0 0 10px;
  color: var(--resume-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.student-identity h1 {
  margin: 0;
  color: #111827;
  font-family: var(--resume-heading-font);
  font-size: 38px;
  line-height: 1.08;
  letter-spacing: 0.05em;
}

.student-target {
  margin: 10px 0 16px;
  color: #334155;
  font-size: 15px;
  font-weight: 700;
}

.student-contact-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 20px;
  color: #475569;
  font-size: 12px;
}

.student-contact-list strong {
  margin-right: 6px;
  color: #172033;
  font-style: normal;
}

.student-avatar {
  width: 88px;
  height: 112px;
  border: 1px solid #cbd5e1;
  border-radius: 2px;
  object-fit: cover;
  box-shadow: 8px 8px 0 rgba(47, 128, 167, 0.14);
}

.student-education-spotlight {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 24px;
  margin: 18px 0 22px;
  padding: 14px 18px;
  background: #eff7fa;
  border-left: 4px solid var(--resume-primary);
}

.student-section-kicker {
  padding-top: 4px;
  color: var(--resume-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.student-education-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 20px;
}

.student-education-item + .student-education-item {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #cbd5e1;
}

.student-education-item h2,
.student-item h3 {
  margin: 0;
  color: #172033;
  font-size: 15px;
  line-height: 1.35;
}

.student-education-item p,
.student-item-header p {
  margin: 3px 0 0;
  color: #526174;
  font-size: 12px;
}

.student-education-item time,
.student-item time {
  color: #64748b;
  font-size: 11px;
  white-space: nowrap;
}

.student-education-item > .student-description {
  grid-column: 1 / -1;
}

.student-section + .student-section {
  margin-top: max(14px, calc(var(--resume-section-spacing) - 5px));
}

.student-section-heading {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  align-items: end;
  margin-bottom: 10px;
}

.student-section-heading > span {
  padding-bottom: 4px;
  color: var(--resume-primary);
  font-size: 12px;
  font-weight: 800;
  border-bottom: 3px solid var(--resume-primary);
}

.student-section-heading p {
  margin: 0 0 2px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.student-section-heading h2 {
  margin: 0;
  color: #172033;
  font-family: var(--resume-heading-font);
  font-size: 19px;
  line-height: 1.2;
}

.student-items {
  display: grid;
  gap: var(--resume-item-spacing);
  padding-left: 46px;
}

.student-item {
  padding: 0 0 10px;
  border-bottom: 1px solid #e2e8f0;
}

.student-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.student-item-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
}

.student-description {
  margin: 7px 0 0;
  color: #3f4d60;
  font-size: var(--resume-font-size);
  line-height: var(--resume-line-height);
  white-space: pre-line;
}

.student-skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding-left: 46px;
}

.student-skills-list span {
  padding: 5px 10px;
  color: #223247;
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  border: 1px solid #dbe4ed;
}

.student-summary {
  margin-left: 46px;
  padding: 12px 16px;
  background: #f8fafc;
  border-left: 3px solid #cbd5e1;
}

.student-summary p {
  margin: 0;
  color: #3f4d60;
  line-height: var(--resume-line-height);
}

@media (max-width: 900px) {
  .core-preview-shell {
    padding: 16px;
  }

  .resume-sheet {
    min-height: auto;
    padding: 28px 22px;
    border-radius: 18px;
  }

  .resume-sheet.layout-qm-student-editorial {
    padding: 30px 24px 34px;
  }

  .resume-sheet.layout-qm-table-formal {
    padding: 26px 18px 30px;
  }

  .formal-profile-table {
    min-width: 620px;
  }

  .resume-sheet.layout-qm-table-formal {
    overflow-x: auto;
  }

  .formal-item-meta {
    grid-template-columns: 1fr;
  }

  .formal-item-meta > * {
    border-right: 0;
    border-bottom: 1px solid #c4ced8;
  }

  .student-resume-header,
  .student-education-spotlight,
  .student-education-item,
  .student-item-header {
    grid-template-columns: 1fr;
  }

  .student-avatar {
    grid-row: 1;
    justify-self: start;
  }

  .student-items,
  .student-skills-list {
    padding-left: 0;
  }

  .student-summary {
    margin-left: 0;
  }

  .resume-header,
  .timeline-hero,
  .timeline-card-top,
  .spotlight-card-head {
    flex-direction: column;
  }

  .resume-header {
    grid-template-columns: 1fr;
    grid-template-areas:
      "avatar"
      "identity"
      "meta";
  }

  .resume-avatar-wrap {
    justify-content: flex-start;
  }

  .variant-classic,
  .variant-compact,
  .variant-editorial {
    padding-top: 28px;
  }

  .variant-classic::before {
    display: none;
  }

  .variant-classic .resume-header,
  .variant-ats .resume-header,
  .variant-executive .resume-header,
  .variant-compact .resume-header,
  .variant-editorial .resume-header {
    grid-template-columns: 1fr;
    grid-template-areas:
      "avatar"
      "identity"
      "meta";
    text-align: left;
  }

  .timeline-hero,
  .spotlight-hero {
    grid-template-columns: 1fr;
  }

  .ats-resume-header,
  .ats-resume-header.has-avatar {
    grid-template-columns: 1fr;
  }

  .ats-avatar-wrap {
    justify-content: flex-start;
  }

  .timeline-contact-grid {
    grid-template-columns: 1fr;
  }

  .resume-header-side {
    width: 100%;
    flex-direction: column;
  }

  .timeline-avatar {
    justify-self: start;
  }

  .sidebar-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .spotlight-body {
    grid-template-columns: 1fr;
  }

  .resume-meta {
    min-width: 0;
  }

  .resume-sheet.variant-sidebar {
    padding: 0;
  }

  .sidebar-column,
  .sidebar-main,
  .spotlight-side,
  .spotlight-main {
    padding: 26px 22px;
  }
}
</style>
