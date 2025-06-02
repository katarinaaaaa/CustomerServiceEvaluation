import os
import logging
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from tortoise.contrib.fastapi import register_tortoise
from models import *
from fastapi.middleware.cors import CORSMiddleware
from llm_handling import ModelHandler


load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger()
    
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:3000'], 
                   allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

model = ModelHandler()
with open(os.getenv("SCORING_TEMPLATE_SRC"), 'r', encoding="utf-8") as f:
    analysis_template = f.read()
with open(os.getenv("SCRIPT_TEMPLATE_SRC"), 'r', encoding="utf-8") as f:
    script_template = f.read()

@app.get('/')
def index():
    return RedirectResponse('/docs')

@app.get('/auth/')
async def check_auth(id: str, password: str):
    user_obj = await User.get_or_none(comp_id=id)
    if user_obj:
        user = await user_pydantic.from_tortoise_orm(user_obj)
        if user.password == password:
            return {"status": "ok", "data": {'user_id': user.id, 'rights': user.rights, 'name': user.name}}
        else:
            return {"status": "false"}
    else:
        return {"status": "false"}


@app.get('/script')
async def get_all_scripts():
    response = await script_pydantic.from_queryset(Script.all())
    return {"status": "ok", "data": response}

@app.get('/script/{script_id}')
async def get_script(script_id: int):
    response = await script_pydantic.from_queryset_single(Script.get(id=script_id).order_by('role'))
    return {"status": "ok", "data": response}

@app.post('/script')
async def create_script(script_info: script_pydantic_in):
    script_obj = await Script.create(**script_info.dict(exclude_unset=True))
    response = await script_pydantic.from_tortoise_orm(script_obj)
    return {"status": "ok", "data": response}

@app.put("/script/{script_id}")
async def update_script(script_id: int, update_info: script_pydantic_in):
    script = await Script.get(id=script_id)
    update_info = update_info.dict(exclude_unset=True)
    script.name = update_info['name']
    script.script_text = update_info['script_text']
    script.role = update_info['role']
    await script.save()
    response = await script_pydantic.from_tortoise_orm(script)
    return {"status": "ok", "data": response}

@app.delete("/script/{script_id}")
async def delete_script(script_id: int):
    await Script.get(id=script_id).delete()
    return {"status": "ok"}


@app.get('/operator')
async def get_all_operators():
    operators = await user_pydantic.from_queryset(User.filter(rights="operator").order_by('role'))
    result = []
    for operator in operators:
        dialogues = await dialogue_pydantic.from_queryset(Dialogue.filter(oper=operator.id, time__gte=datetime.now().date()-timedelta(days=30)))
        scores, matchings = [], []
        for dialogue in dialogues:
            score_analysis = await scoring_analysis_pydantic.from_queryset(ScoringAnalysis.filter(dialogue=dialogue.id))
            if score_analysis:
                scores.append(score_analysis[0].total_score)

            script_analysis = await script_analysis_pydantic.from_queryset(ScriptAnalysis.filter(dialogue=dialogue.id))
            if script_analysis:
                matchings.append(script_analysis[0].script_score)
        
        # get month average operator score
        if scores == []:
            average_score = None
        else:
            average_score = round(sum(scores) / len(scores), 2)

        # get month average operator script matching
        if matchings == []:
            average_match = None
        else:
            average_match = round(sum(matchings) / len(matchings), 2)
        
        operator_dict = operator.model_dump()
        operator_dict['dialogues_num'] = len(dialogues)
        operator_dict['score'] = average_score
        operator_dict['script_score'] = average_match
        result.append(operator_dict)
    return {"status": "ok", "data": result}

@app.get('/operatornames')
async def get_all_operator_names():
    operators = await user_pydantic.from_queryset(User.filter(rights="operator"))
    result = []
    for oper in operators:
        result.append({"id": oper.id, "name": oper.surname + " " + oper.name + " " + oper.patronymic})
    return {"status": "ok", "data": result}


@app.get('/operator/{user_id}')
async def get_operator(user_id: int):
    response = await user_pydantic.from_queryset_single(User.get(id=user_id))
    return {"status": "ok", "data": response}

@app.put("/operatorrole/{oper_id}")
async def update_operator_role(oper_id: int, update_info: user_pydantic_role_in):
    oper = await User.get(id=oper_id)
    update_info = update_info.dict(exclude_unset=True)
    oper.role = update_info['role']
    await oper.save()
    response = await user_pydantic.from_tortoise_orm(oper)
    return {"status": "ok", "data": response}

@app.get('/role')
async def get_all_roles():
    scripts = await script_pydantic.from_queryset(Script.all())
    roles = []
    for script in scripts:
        if script.role:
            roles.append(script.role)
    result = list(set(roles))
    return {"status": "ok", "data": result}


@app.get('/dialogue')
async def get_all_dialogues():
    dialogues = await Dialogue.all().order_by('-time').prefetch_related('oper')
    result = []
    for dialogue_obj in dialogues:
        dialogue = await dialogue_pydantic.from_tortoise_orm(dialogue_obj)
        dialogue_dict = dialogue.model_dump()
        dialogue_dict['oper'] = dialogue_obj.oper.surname + " " + dialogue_obj.oper.name + " " + dialogue_obj.oper.patronymic
        dialogue_dict['oper_id'] = dialogue_obj.oper.id

        score_analysis = await scoring_analysis_pydantic.from_queryset(ScoringAnalysis.filter(dialogue=dialogue.id))
        if (score_analysis):
            dialogue_dict['score'] = round(score_analysis[0].total_score, 2)
            dialogue_dict['theme'] = score_analysis[0].theme
        
        script_analysis = await script_analysis_pydantic.from_queryset(ScriptAnalysis.filter(dialogue=dialogue.id))
        if (script_analysis):
            dialogue_dict['script_score'] = round(script_analysis[0].script_score, 2)

        result.append(dialogue_dict)

    return {"status": "ok", "data": result }

@app.get('/dialogue/{dialogue_id}')
async def get_dialogue(dialogue_id: int):
    dialogue_obj = await Dialogue.get(id=dialogue_id).prefetch_related('oper')
    dialogue = await dialogue_pydantic.from_tortoise_orm(dialogue_obj)
    dialogue_dict = dialogue.model_dump()

    dialogue_dict['oper'] = dialogue_obj.oper.surname + " " + dialogue_obj.oper.name + " " + dialogue_obj.oper.patronymic
    score_analysis = await scoring_analysis_pydantic.from_queryset(ScoringAnalysis.filter(dialogue=dialogue.id))
    if (score_analysis):
        score_analysis_dict = score_analysis[0].model_dump()
        del score_analysis_dict['id']
        result = {**dialogue_dict, **score_analysis_dict}
    
    script_analysis_obj = await ScriptAnalysis.filter(dialogue=dialogue.id).prefetch_related('script').first()
    script_analysis = await script_analysis_pydantic.from_tortoise_orm(script_analysis_obj)
    
    if (script_analysis):
        script_analysis_dict = script_analysis.model_dump()
        del script_analysis_dict['id']
        del script_analysis_dict['theme']
        result = {**result, **script_analysis_dict}
        result['role'] = script_analysis_obj.script.role
        result['script'] = script_analysis_obj.script.script_text

    return {"status": "ok", "data": result }

@app.post('/dialogue/{oper_id}')
async def create_dialogue(oper_id: int, dialogue_info: dialogue_pydantic_in):
    info_json = dialogue_info.model_dump()
    dialogue_obj = await Dialogue.create(text=info_json['text'], oper_id=oper_id, time=datetime.now(timezone.utc))
    dialogue = await dialogue_pydantic.from_tortoise_orm(dialogue_obj)
    
    prompt_scoring = analysis_template.format(dialogue.text)
    answer = model.get_answer(prompt_scoring)

    scoring = {}
    try:
        answer_json = json.loads(answer)
        scoring['theme'] = answer_json['theme']
        scoring['result'] = answer_json['result']
        scoring['result_comment'] = answer_json['result_comment']
        scoring['recs'] = answer_json['recommendations']

        criteria_arr = answer_json['criteria']
        scoring['prof_score'], scoring['prof_com'] = criteria_arr[0]['score'], criteria_arr[0]['comments']
        scoring['reg_score'], scoring['reg_com'] = criteria_arr[1]['score'], criteria_arr[1]['comments']
        scoring['eff_score'], scoring['eff_com'] = criteria_arr[2]['score'], criteria_arr[2]['comments']
        scoring['res_score'], scoring['res_com'] = criteria_arr[3]['score'], criteria_arr[3]['comments']
        scoring['gram_score'], scoring['gram_com'] = criteria_arr[4]['score'], criteria_arr[4]['comments']
        scoring['emp_score'], scoring['emp_com'] = criteria_arr[5]['score'], criteria_arr[5]['comments']
        
        scoring['total_score'] = 0
        for crit in criteria_arr:
            if crit['score'] is not None:
                scoring['total_score'] += crit['score']

        scoring['total_score'] = round(scoring['total_score'] / 6, 2)
        scoring['dialogue_id'] = dialogue.id
    except:
        await dialogue_obj.delete()
        return {"status": "fail"}
    s_obj = await ScoringAnalysis.create(**scoring)
    response = await scoring_analysis_pydantic.from_tortoise_orm(s_obj)

    oper = await user_pydantic.from_queryset_single(User.get(id=oper_id))
    script = await script_pydantic.from_queryset(Script.filter(role=oper.role))

    prompt = script_template.format(script[0].script_text, dialogue.text)
    answer = model.get_answer(prompt)

    matching = {}
    try:
        answer_json= json.loads(answer)
        matching['theme'] = answer_json['theme']
        matching['script_score'] = answer_json['script_score']
        matching['script_comment'] = answer_json['script_comment']
        matching['script_recs'] = answer_json['script_recommendations']
        matching['dialogue_id'] = dialogue.id
        matching['script_id'] = script[0].id
    except:
        await dialogue_obj.delete()
        return {"status": "fail"}
    s_obj = await ScriptAnalysis.create(**matching)
    response = await script_analysis_pydantic.from_tortoise_orm(s_obj)
    return {"status": "ok", "data": dialogue.id}

     
register_tortoise(
    app,
    db_url=f"postgres://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}",
    modules={"models": ["models"]},
    generate_schemas=False, # не создавать таблицы
    add_exception_handlers=True # включить обработчики ошибок
)