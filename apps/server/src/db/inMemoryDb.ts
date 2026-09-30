import {
  CitizenRequest,
  RequestMedia,
  Hotspot,
  AIRecommendation,
  InfrastructureAsset,
  DataSourceItem,
  User,
  Project,
  NotificationItem,
  AuditLogItem,
  RequestStatus,
  RequestCategory,
} from '../../../../packages/shared/src/types';
import {
  SEED_USERS,
  SEED_REQUESTS,
  SEED_HOTSPOTS,
  SEED_RECOMMENDATIONS,
  SEED_INFRASTRUCTURE,
  SEED_PROJECTS,
  SEED_DATA_SOURCES,
} from './seedData';

class InMemoryDatabase {
  private users: (User & { passwordHash: string })[] = [];
  private requests: CitizenRequest[] = [];
  private mediaRecords: RequestMedia[] = [];
  private hotspots: Hotspot[] = [];
  private recommendations: AIRecommendation[] = [];
  private infrastructure: InfrastructureAsset[] = [];
  private projects: Project[] = [];
  private dataSources: DataSourceItem[] = [];
  private notifications: NotificationItem[] = [];
  private auditLogs: AuditLogItem[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.requests = JSON.parse(JSON.stringify(SEED_REQUESTS));
    this.hotspots = JSON.parse(JSON.stringify(SEED_HOTSPOTS));
    this.recommendations = JSON.parse(JSON.stringify(SEED_RECOMMENDATIONS));
    this.infrastructure = JSON.parse(JSON.stringify(SEED_INFRASTRUCTURE));
    this.projects = JSON.parse(JSON.stringify(SEED_PROJECTS));
    this.dataSources = JSON.parse(JSON.stringify(SEED_DATA_SOURCES));

    // Populate initial media records from seed requests
    this.mediaRecords = [];
    this.requests.forEach((req) => {
      if (req.media && Array.isArray(req.media)) {
        req.media.forEach((m) => this.mediaRecords.push(m));
      }
    });

    this.notifications = [
      {
        id: 'notif-1',
        userId: 'usr-citizen-1',
        title: 'Status Update: Road Request REQ-2026-0081',
        message: 'Your report regarding Chohtan link road has been marked UNDER_REVIEW by Barmer District Works.',
        type: 'STATUS_CHANGE',
        read: false,
        createdAt: '2026-09-25T09:00:00Z',
      },
      {
        id: 'notif-2',
        userId: 'usr-officer-district',
        title: 'High-Demand Hotspot Alert',
        message: 'New road infrastructure hotspot detected in Chohtan Block with 89 correlated requests.',
        type: 'HOTSPOT_ALERT',
        read: false,
        createdAt: '2026-09-24T10:00:00Z',
      },
    ];

    this.auditLogs = [
      {
        id: 'aud-1',
        userId: 'usr-admin',
        userName: 'System Administrator',
        action: 'SYSTEM_INITIALIZATION',
        entity: 'DATABASE',
        entityId: 'SYSTEM',
        metadata: { status: 'INITIALIZED', initialRequests: this.requests.length },
        createdAt: '2026-09-24T08:00:00Z',
      },
    ];
  }

  // --- Users ---
  public findUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  public findUserByIdentifier(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    return this.users.find(
      (u) =>
        (u.officerId && u.officerId.toLowerCase() === clean) ||
        (u.email && u.email.toLowerCase() === clean) ||
        (u.phone && (u.phone === identifier || u.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '')))
    );
  }

  public createUser(user: User & { passwordHash: string }) {
    this.users.push(user);
    this.logAudit({
      userId: user.id,
      userName: user.name,
      action: 'USER_REGISTERED',
      entity: 'USER',
      entityId: user.id,
    });
    return user;
  }

  public getAllUsers() {
    return this.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  // --- Media ---
  public getMediaForRequest(requestId: string): RequestMedia[] {
    return this.mediaRecords.filter((m) => m.requestId === requestId);
  }

  public getMediaById(id: string): RequestMedia | undefined {
    return this.mediaRecords.find((m) => m.id === id);
  }

  public createMediaRecord(media: RequestMedia): RequestMedia {
    this.mediaRecords.push(media);
    const req = this.requests.find((r) => r.id === media.requestId);
    if (req) {
      if (!req.media) req.media = [];
      if (!req.media.some((m) => m.id === media.id)) {
        req.media.push(media);
      }
    }
    return media;
  }

  // --- Requests ---
  public getRequests(filters?: {
    category?: string;
    status?: string;
    urgency?: string;
    state?: string;
    district?: string;
    search?: string;
    citizenId?: string;
  }) {
    let result = [...this.requests];

    if (filters) {
      if (filters.citizenId) {
        result = result.filter((r) => r.citizenId === filters.citizenId);
      }
      if (filters.category && filters.category !== 'ALL') {
        result = result.filter((r) => r.category === filters.category);
      }
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((r) => r.status === filters.status);
      }
      if (filters.urgency && filters.urgency !== 'ALL') {
        result = result.filter((r) => r.urgency === filters.urgency);
      }
      if (filters.state && filters.state !== 'ALL') {
        result = result.filter((r) => r.state === filters.state);
      }
      if (filters.district && filters.district !== 'ALL') {
        result = result.filter((r) => r.district === filters.district);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (r) =>
            r.id.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.originalText.toLowerCase().includes(q) ||
            (r.sanitizedText && r.sanitizedText.toLowerCase().includes(q)) ||
            (r.translatedText && r.translatedText.toLowerCase().includes(q)) ||
            (r.village && r.village.toLowerCase().includes(q)) ||
            (r.district && r.district.toLowerCase().includes(q))
        );
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRequestById(id: string) {
    return this.requests.find((r) => r.id === id);
  }

  public createRequest(request: CitizenRequest) {
    this.requests.unshift(request);
    if (request.media && Array.isArray(request.media)) {
      request.media.forEach((m) => {
        if (!this.mediaRecords.some((existing) => existing.id === m.id)) {
          this.mediaRecords.push(m);
        }
      });
    }
    this.recalculateHotspotsAfterNewRequest(request);
    this.logAudit({
      userId: request.citizenId,
      userName: request.citizenName || 'Citizen',
      action: 'REQUEST_SUBMITTED',
      entity: 'REQUEST',
      entityId: request.id,
      metadata: { category: request.category, district: request.district, state: request.state },
    });
    return request;
  }

  public updateRequestStatus(
    id: string,
    status: RequestStatus,
    comment?: string,
    updatedBy = 'Government Officer'
  ) {
    const req = this.requests.find((r) => r.id === id);
    if (!req) return null;

    req.status = status;
    req.updatedAt = new Date().toISOString();

    if (!req.statusHistory) req.statusHistory = [];
    req.statusHistory.push({
      id: `hist-${Date.now()}`,
      requestId: req.id,
      status,
      comment: comment || `Status updated to ${status}`,
      updatedBy,
      createdAt: new Date().toISOString(),
    });

    // Notify citizen
    this.createNotification({
      id: `notif-${Date.now()}`,
      userId: req.citizenId,
      title: `Request ${req.id} Status Updated`,
      message: `Your report regarding "${req.title.substring(0, 45)}..." is now ${status}. ${comment || ''}`,
      type: 'STATUS_CHANGE',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.logAudit({
      action: 'REQUEST_STATUS_UPDATED',
      entity: 'REQUEST',
      entityId: req.id,
      metadata: { status, updatedBy, comment },
    });

    return req;
  }

  // --- Hotspots ---
  public getHotspots(filters?: { state?: string; district?: string; category?: string }) {
    let list = [...this.hotspots];
    if (filters) {
      if (filters.state && filters.state !== 'ALL') list = list.filter((h) => h.state === filters.state);
      if (filters.district && filters.district !== 'ALL') list = list.filter((h) => h.district === filters.district);
      if (filters.category && filters.category !== 'ALL') list = list.filter((h) => h.category === filters.category);
    }
    return list.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  public getHotspotById(id: string) {
    return this.hotspots.find((h) => h.id === id);
  }

  private recalculateHotspotsAfterNewRequest(newReq: CitizenRequest) {
    // Check if near an existing hotspot (within ~25km)
    const existing = this.hotspots.find(
      (h) =>
        h.category === newReq.category &&
        h.district.toLowerCase() === newReq.district.toLowerCase() &&
        (newReq.latitude != null && newReq.longitude != null
          ? this.calculateDistanceKm(h.latitude, h.longitude, newReq.latitude, newReq.longitude) < 30
          : true)
    );

    if (existing) {
      existing.requestCount += 1;
      existing.populationAffected += 1200;
      existing.breakdown.citizenDemand = Math.min(25, existing.breakdown.citizenDemand + 0.3);
      existing.priorityScore = Math.min(
        100,
        parseFloat(
          (
            existing.breakdown.citizenDemand +
            existing.breakdown.populationImpact +
            existing.breakdown.infrastructureGap +
            existing.breakdown.urgency +
            existing.breakdown.accessibility
          ).toFixed(1)
        )
      );
      existing.updatedAt = new Date().toISOString();
    }
  }

  // --- Recommendations ---
  public getRecommendations(filters?: { state?: string; category?: string; status?: string }) {
    let list = [...this.recommendations];
    if (filters) {
      if (filters.state && filters.state !== 'ALL') list = list.filter((r) => r.state === filters.state);
      if (filters.category && filters.category !== 'ALL') list = list.filter((r) => r.category === filters.category);
      if (filters.status && filters.status !== 'ALL') list = list.filter((r) => r.status === filters.status);
    }
    return list.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  public getRecommendationById(id: string) {
    return this.recommendations.find((r) => r.id === id);
  }

  public updateRecommendationStatus(
    id: string,
    status: AIRecommendation['status'],
    notes?: string,
    reviewer = 'Government Authority'
  ) {
    const rec = this.recommendations.find((r) => r.id === id);
    if (!rec) return null;

    rec.status = status;
    rec.reviewedBy = reviewer;
    rec.reviewedAt = new Date().toISOString();

    if (status === 'APPROVED_FOR_PLANNING') {
      const existingProject = this.projects.find((p) => p.recommendationId === rec.id);
      if (!existingProject) {
        this.projects.push({
          id: `PRJ-AUTO-${Date.now().toString().slice(-4)}`,
          recommendationId: rec.id,
          name: rec.title,
          description: rec.description,
          location: rec.location,
          category: rec.category,
          budget: parseFloat((rec.priorityScore * 0.25).toFixed(1)),
          status: 'SANCTIONED_FOR_DPR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    this.logAudit({
      action: 'RECOMMENDATION_REVIEWED',
      entity: 'AI_RECOMMENDATION',
      entityId: rec.id,
      metadata: { status, reviewer, notes },
    });

    return rec;
  }

  // --- Infrastructure & Projects ---
  public getInfrastructure(filters?: { type?: string; district?: string }) {
    let list = [...this.infrastructure];
    if (filters) {
      if (filters.type && filters.type !== 'ALL') list = list.filter((i) => i.type === filters.type);
      if (filters.district && filters.district !== 'ALL') list = list.filter((i) => i.district === filters.district);
    }
    return list;
  }

  public getProjects() {
    return [...this.projects];
  }

  public getDataSources() {
    return [...this.dataSources];
  }

  // --- Notifications ---
  public getNotifications(userId: string) {
    return this.notifications
      .filter((n) => n.userId === userId || n.userId === 'ALL')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notif: NotificationItem) {
    this.notifications.unshift(notif);
    return notif;
  }

  public markNotificationRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) n.read = true;
    return n;
  }

  // --- Audit Logs ---
  public getAuditLogs() {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public logAudit(entry: Omit<AuditLogItem, 'id' | 'createdAt'>) {
    const item: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(item);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return item;
  }

  // --- Distance utility (Haversine) ---
  public calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }
}

export const db = new InMemoryDatabase();
