from django.urls import path
from .views import WorkflowTemplateListCreateView, WorkflowTemplateRetrieveUpdateDestroyView

urlpatterns = [
    path('', WorkflowTemplateListCreateView.as_view(), name='workflow_list_create'),
    path('<uuid:pk>/', WorkflowTemplateRetrieveUpdateDestroyView.as_view(), name='workflow_detail'),
]
