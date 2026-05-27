from datetime import datetime
from pydantic import BaseModel


class CorrectionRead(BaseModel):
    id:               int
    user_id:          int
    planification_id: int | None
    dictee_id:        int
    eleve_id:         int | None
    student_name:     str
    image_path:       str | None
    score:            int
    nb_errors:        int
    err_conjugaison:  int
    err_homophone:    int
    err_accord:       int
    err_majuscule:    int
    err_ponctuation:  int
    err_infinitif:    int
    err_orthographe:  int
    err_non_present:  int
    err_son:          int
    created_at:       datetime

    model_config = {"from_attributes": True}
