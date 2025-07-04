module default {
  type MealPlan {
    required user_id: str {
      default := 'anonymous';
    };
    required meal_plan: json;
    required current: bool {
      default := false;
    };
    required week_of: datetime;
    meal_times: json;
    required created_at: datetime {
      default := datetime_current();
    };
  }

  type Preferences {
    required user_id: str {
      default := 'anonymous';
      constraint exclusive;
    };
    required preferences: json;
    required created_at: datetime {
      default := datetime_current();
    };
    required updated_at: datetime {
      default := datetime_current();
    };
  }
}
