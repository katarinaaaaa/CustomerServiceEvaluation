from tortoise.models import Model
from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator

class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    surname = fields.CharField(max_length=255)
    patronymic = fields.CharField(max_length=255)
    comp_id = fields.CharField(max_length=255)
    password = fields.TextField()
    rights = fields.CharField(max_length=255)
    role = fields.CharField(max_length=255)
    
    class Meta:
        table = "users"

class Script(Model):
    id = fields.IntField(pk=True)
    name = fields.TextField()
    script_text = fields.TextField()
    role = fields.CharField(max_length=255)
    
    class Meta:
        table = "scripts"

class Dialogue(Model):
    id = fields.IntField(pk=True)
    oper = fields.ForeignKeyField('models.User', related_name="oper_dialogues")
    time = fields.DatetimeField()
    text = fields.TextField()
    
    class Meta:
        table = "dialogues"

class ScoringAnalysis(Model):
    id = fields.IntField(pk=True)
    dialogue = fields.ForeignKeyField('models.Dialogue', related_name="scoring")
    theme = fields.TextField()
    prof_score, prof_com = fields.IntField(null=True), fields.TextField()
    reg_score, reg_com = fields.IntField(null=True), fields.TextField()
    eff_score, eff_com = fields.IntField(null=True), fields.TextField()
    res_score, res_com = fields.IntField(null=True), fields.TextField()
    gram_score, gram_com = fields.IntField(null=True), fields.TextField()
    emp_score, emp_com = fields.IntField(null=True), fields.TextField()
    total_score = fields.FloatField()
    result = fields.CharField(max_length=255)
    result_comment = fields.TextField()
    recs = fields.TextField()

    class Meta:
        table = "scoring_analysis"

class ScriptAnalysis(Model):
    id = fields.IntField(pk=True)
    dialogue = fields.ForeignKeyField('models.Dialogue', related_name="matching")
    script = fields.ForeignKeyField('models.Script', related_name="matching")
    theme = fields.TextField()
    script_score = fields.IntField()
    script_comment = fields.TextField()
    script_recs = fields.TextField()
        
    class Meta:
        table = "script_analysis"

script_pydantic = pydantic_model_creator(Script, name="scripts")
script_pydantic_in = pydantic_model_creator(Script, name="scripts_in", exclude_readonly=True)

user_pydantic = pydantic_model_creator(User, name="user")
user_pydantic_role_in = pydantic_model_creator(User, name="user_in", exclude=["id", "name", "surname", "patronymic",
                                                                        "comp_id", "password", "rights"])

dialogue_pydantic = pydantic_model_creator(Dialogue, name="dialogue")
dialogue_pydantic_in = pydantic_model_creator(Dialogue, name="dialogue_in", exclude=["id", "time"])

scoring_analysis_pydantic = pydantic_model_creator(ScoringAnalysis, name="scoring_analysis")
script_analysis_pydantic = pydantic_model_creator(ScriptAnalysis, name="script_analysis")