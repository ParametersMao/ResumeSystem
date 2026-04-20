<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <RouterLink class="brand" to="/home">简历系统</RouterLink>
        <nav class="nav-links">
          <RouterLink to="/home">首页</RouterLink>
          <RouterLink to="/templates">模板中心</RouterLink>
          <RouterLink to="/resumes">我的简历</RouterLink>
          <RouterLink to="/account">个人中心</RouterLink>
        </nav>
      </div>
    </header>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f7f8fa;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e2e8f0;
}

.app-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.nav-links a {
  color: #475569;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.nav-links a.router-link-active {
  color: #2563eb;
}

.content {
  min-height: calc(100vh - 73px);
  overflow: auto;
}

@media (max-width: 900px) {
  .app-header__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-links {
    gap: 12px;
  }
}
</style>
