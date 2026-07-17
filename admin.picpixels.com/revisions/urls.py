from django.urls import path
from .views import RevisionRequestListCreateView, RevisionRequestDetailView, AddAnnotationView

urlpatterns = [
    path('', RevisionRequestListCreateView.as_view(), name='revision_list_create'),
    path('<uuid:pk>/', RevisionRequestDetailView.as_view(), name='revision_detail'),
    path('<uuid:revision_id>/annotations/', AddAnnotationView.as_view(), name='add_annotation'),
]
