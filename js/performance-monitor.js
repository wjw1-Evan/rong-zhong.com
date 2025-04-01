// 性能监控和错误追踪模块
const performanceMonitor = {
    init() {
        this.initPerformanceMonitoring();
        this.initErrorTracking();
        this.initResourceTiming();
        this.initUserBehavior();
    },

    // 初始化性能监控
    initPerformanceMonitoring() {
        // 页面加载性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const metrics = {
                    // DNS查询时间
                    dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
                    // TCP连接时间
                    tcpTime: timing.connectEnd - timing.connectStart,
                    // 首字节时间
                    ttfb: timing.responseStart - timing.navigationStart,
                    // DOM解析时间
                    domParseTime: timing.domComplete - timing.domInteractive,
                    // 页面完全加载时间
                    loadTime: timing.loadEventEnd - timing.navigationStart,
                    // 首次内容绘制时间
                    fcp: this.getFCP(),
                    // 最大内容绘制时间
                    lcp: this.getLCP(),
                    // 首次输入延迟
                    fid: this.getFID()
                };

                this.sendMetrics('page_load', metrics);
            }, 0);
        });
    },

    // 获取首次内容绘制时间
    getFCP() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : 0;
    },

    // 获取最大内容绘制时间
    getLCP() {
        let lcp = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        return lcp;
    },

    // 获取首次输入延迟
    getFID() {
        let fid = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const firstEntry = entries[0];
            fid = firstEntry.processingStart - firstEntry.startTime;
        }).observe({ entryTypes: ['first-input'] });
        return fid;
    },

    // 初始化错误追踪
    initErrorTracking() {
        // JS错误监控
        window.addEventListener('error', (event) => {
            const errorData = {
                type: 'js_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack,
                timestamp: new Date().toISOString()
            };
            this.sendMetrics('error', errorData);
        });

        // Promise错误监控
        window.addEventListener('unhandledrejection', (event) => {
            const errorData = {
                type: 'promise_error',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            };
            this.sendMetrics('error', errorData);
        });

        // 资源加载错误监控
        window.addEventListener('error', (event) => {
            if (event.target.tagName) {
                const errorData = {
                    type: 'resource_error',
                    element: event.target.tagName.toLowerCase(),
                    source: event.target.src || event.target.href,
                    timestamp: new Date().toISOString()
                };
                this.sendMetrics('error', errorData);
            }
        }, true);
    },

    // 初始化资源计时
    initResourceTiming() {
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (entry.initiatorType === 'img' || entry.initiatorType === 'css' || entry.initiatorType === 'script') {
                    const resourceMetrics = {
                        name: entry.name,
                        type: entry.initiatorType,
                        duration: entry.duration,
                        size: entry.transferSize,
                        timestamp: new Date().toISOString()
                    };
                    this.sendMetrics('resource_timing', resourceMetrics);
                }
            });
        }).observe({ entryTypes: ['resource'] });
    },

    // 初始化用户行为追踪
    initUserBehavior() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            const visibilityData = {
                state: document.visibilityState,
                timestamp: new Date().toISOString()
            };
            this.sendMetrics('visibility', visibilityData);
        });

        // 用户交互追踪
        const interactionEvents = ['click', 'scroll', 'keypress'];
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                const interactionData = {
                    type: eventType,
                    path: window.location.pathname,
                    timestamp: new Date().toISOString()
                };
                this.sendMetrics('interaction', interactionData);
            }, { passive: true });
        });
    },

    // 发送指标数据
    sendMetrics(type, data) {
        // 添加通用信息
        const metrics = {
            ...data,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        // 使用 Beacon API 发送数据
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/metrics', JSON.stringify({
                type,
                data: metrics
            }));
        } else {
            // 降级处理：使用 fetch
            fetch('/api/metrics', {
                method: 'POST',
                body: JSON.stringify({
                    type,
                    data: metrics
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: true
            }).catch(console.error);
        }

        // 开发环境下在控制台输出
        if (process.env.NODE_ENV === 'development') {
            console.log(`Performance Metrics - ${type}:`, metrics);
        }
    }
};

export default performanceMonitor; 