/**
 * Base adapter interface for external integrations
 * All adapters must implement idempotent operations with proper error handling
 */
export interface IAdapter {
    name: string;
    healthCheck(): Promise<boolean>;
}
/**
 * MitID authentication adapter interface
 * Handles OIDC/SAML flows for strong authentication
 */
export interface IMitIdAdapter extends IAdapter {
    generateAuthUrl(state: string, redirectUri: string): string;
    exchangeCodeForToken(code: string): Promise<{
        token: string;
        userInfo: MitIdUserInfo;
    }>;
    validateToken(token: string): Promise<MitIdUserInfo>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
    }>;
}
export interface MitIdUserInfo {
    sub: string;
    email?: string;
    name?: string;
    cvr?: string;
}
/**
 * CVR (Central Business Registry) lookup adapter
 * Provides company data for pre-fill and validation
 */
export interface ICvrAdapter extends IAdapter {
    lookupByCvr(cvr: string): Promise<CvrData>;
    validateCvrExists(cvr: string): Promise<boolean>;
}
export interface CvrData {
    cvr: string;
    name: string;
    address: {
        street: string;
        zipCode: string;
        city: string;
    };
    status: 'active' | 'inactive';
    industry?: string;
}
/**
 * SKAT submission adapter
 * Handles VAT registration submissions to SKAT/Virk
 */
export interface ISkatAdapter extends IAdapter {
    submitApplication(payload: SkatSubmissionPayload): Promise<SkatSubmissionResponse>;
    getStatus(skatReference: string): Promise<SkatStatus>;
    validatePayload(payload: SkatSubmissionPayload): Promise<{
        valid: boolean;
        errors?: string[];
    }>;
}
export interface SkatSubmissionPayload {
    applicantCvr: string;
    registrationType: string;
    startDate: string;
    documents?: File[];
    metadata?: Record<string, any>;
}
export interface SkatSubmissionResponse {
    skatReference: string;
    status: 'accepted' | 'pending_review' | 'rejected';
    message?: string;
    timestamp: Date;
}
export interface SkatStatus {
    skatReference: string;
    status: 'pending' | 'accepted' | 'rejected' | 'needs_info';
    lastUpdated: Date;
    infoRequests?: string[];
}
/**
 * Notification adapter
 * Handles email, e-Boks, and SMS notifications
 */
export interface INotificationAdapter extends IAdapter {
    sendEmail(to: string, subject: string, body: string, html?: string): Promise<void>;
    sendEboks(recipientId: string, title: string, message: string): Promise<void>;
    sendSms(phoneNumber: string, message: string): Promise<void>;
}
//# sourceMappingURL=adapter.interfaces.d.ts.map