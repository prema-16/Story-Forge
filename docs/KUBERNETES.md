# Kubernetes Architecture & Manifest Guide

StoryForge AI V3 uses Kubernetes for production orchestration across 6 deployment regions.

## Cluster Layout
- **Namespace**: `storyforge`
- **Helm Chart**: `k8s/helm/`
- **Base Manifests**: `k8s/base/`

## Workloads
1. **Backend Deployment**: 2–50 replicas (HPA target: 60% CPU)
2. **Frontend Deployment**: 2–20 replicas (HPA target: 65% CPU)
3. **Render Workers**: StatefulSet / BullMQ scaling workers (Spot instance pools)

## Network & Ingress
- **NGINX Ingress** with TLS termination (`cert-manager` Let's Encrypt)
- **NetworkPolicy**: Strict ingress/egress restriction between namespaces

## Scaling
- **HPA**: Auto-scales based on CPU utilization and queue depth
- **VPA**: Advisory mode for right-sizing request limits
