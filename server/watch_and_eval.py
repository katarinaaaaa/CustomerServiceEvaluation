import logging
import os
import time
import json
from datetime import datetime
from dotenv import load_dotenv
import psycopg2
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from llm_handling import ModelHandler

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger()


class DB:
    def __init__(self):
        self.db = psycopg2.connect(
            database = os.getenv("DB_NAME"),
            host = os.getenv("DB_HOST"),
            user = os.getenv("DB_USER"),
            password = os.getenv("DB_PASSWORD"),
            port = os.getenv("DB_PORT")
        )
        logger.info("Connected to the database")
        self.cursor = self.db.cursor()
        self.create_tables()

    def execute(self, callback):
        try:
            callback()
            self.db.commit()
        except (Exception, psycopg2.DatabaseError) as error:
            logger.error(error)

    def create_tables(self):
        query = """CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            surname VARCHAR(255),
            patronymic VARCHAR(255),
            comp_id VARCHAR(255),
            password TEXT,
            rights VARCHAR(255),
            role VARCHAR(255)
        );"""
        self.execute(lambda: self.cursor.execute(query))

        query = """CREATE TABLE IF NOT EXISTS scripts (
            id SERIAL PRIMARY KEY,
            name TEXT,
            script_text TEXT,
            role VARCHAR(255)            
        );"""
        self.execute(lambda: self.cursor.execute(query))

        query = """CREATE TABLE IF NOT EXISTS dialogues (
            id SERIAL PRIMARY KEY,
            oper_id INT,
            time TIMESTAMPTZ,
            text TEXT
        );"""
        self.execute(lambda: self.cursor.execute(query))

        query = """CREATE TABLE IF NOT EXISTS scoring_analysis (
            id SERIAL PRIMARY KEY,
            dialogue_id INT,
            theme TEXT,
            prof_score INT, prof_com TEXT,
            reg_score INT, reg_com TEXT,
            eff_score INT, eff_com TEXT,
            res_score INT, res_com TEXT,
            gram_score INT, gram_com TEXT,
            emp_score INT, emp_com TEXT,
            total_score REAL,
            result VARCHAR(255),
            result_comment TEXT,
            recs TEXT
        );"""
        self.execute(lambda: self.cursor.execute(query))

        query = """CREATE TABLE IF NOT EXISTS script_analysis (
            id SERIAL PRIMARY KEY,
            dialogue_id INT,
            script_id INT,
            theme TEXT,
            script_score INT,
            script_comment TEXT,
            script_recs TEXT
        );"""
        self.execute(lambda: self.cursor.execute(query))
    

    def add_dialogue(self, oper_id, time, text):         
        query = """
            INSERT INTO dialogues (oper_id, time, text)
            VALUES (%s, %s, %s)
            RETURNING id;
        ;"""
        callback = lambda: self.cursor.execute(query, (oper_id, time, text,))
        self.execute(callback)
        dialogue_id = self.cursor.fetchone()[0]
        return dialogue_id

    def delete_dialogue(self, dialogue_id):  
        query = """
            DELETE FROM dialogues WHERE id = %s
        ;"""
        callback = lambda: self.cursor.execute(query, (dialogue_id,))
        self.execute(callback)
    
    def add_scoring_analysis(self, dialogue_id, theme, criteria, total_score, result, result_comment, recs):
        query = """
            INSERT INTO scoring_analysis (
            dialogue_id, theme, 
            prof_score, prof_com, reg_score, reg_com,
            eff_score, eff_com, res_score, res_com,
            gram_score, gram_com, emp_score, emp_com,
            total_score, result, result_comment, recs
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ;"""
        callback = lambda: self.cursor.execute(query, (
            dialogue_id, theme, 
            criteria['prof_score'], criteria['prof_com'], criteria['reg_score'], criteria['reg_com'],
            criteria['eff_score'], criteria['eff_com'], criteria['res_score'], criteria['res_com'],
            criteria['gram_score'], criteria['gram_com'], criteria['emp_score'], criteria['emp_com'],
            total_score, result, result_comment, recs
        ))
        self.execute(callback)

    def add_script_analysis(self, dialogue_id, script_id, theme, script_score, script_comment, script_recs):
        query = """
            INSERT INTO script_analysis (dialogue_id, script_id, theme, script_score, script_comment, script_recs)
            VALUES (%s, %s, %s, %s, %s, %s)
        ;"""
        callback = lambda: self.cursor.execute(query, (dialogue_id, script_id, theme, script_score, script_comment, script_recs))
        self.execute(callback)

    def get_script(self, comp_id):
        query = """SELECT role FROM users WHERE id = %s;"""
        self.execute(lambda: self.cursor.execute(query, (comp_id,)))
        role = self.cursor.fetchone()[0]

        query = """SELECT id, script_text FROM scripts WHERE role = %s;"""
        self.execute(lambda: self.cursor.execute(query, (role,)))
        result = self.cursor.fetchone()
        script_id = result[0]
        script = result[1]
        return script_id, script
    
    def get_oper_id(self, comp_id):
        query = """SELECT id FROM users WHERE comp_id = %s;"""
        self.execute(lambda: self.cursor.execute(query, (comp_id,)))
        id = self.cursor.fetchone()
        if id is not None:
            return id[0]
        else:
            return None


    def __del__(self):
        self.cursor.close()
        self.db.close()


class Evaluator():
    """ Реализует анализ диалога с помощью большой языковой модели и сохранение результатов в БД """    
    def __init__(self):
        self.model = ModelHandler()
        self.db = DB()
        with open(os.getenv("SCORING_TEMPLATE_SRC"), 'r', encoding="utf-8") as f:
            self.analysis_template = f.read()
        with open(os.getenv("SCRIPT_TEMPLATE_SRC"), 'r', encoding="utf-8") as f:
            self.script_template = f.read()

    def process_dialogue(self, path):
        with open(path, 'r', encoding="utf-8") as f:
            dialogue = f.read()
        oper_id = path.split("\\")[-2] # id сотрудника в компании
        user_id = self.db.get_oper_id(oper_id) # id сотрудника в бд
        if user_id == None:
            logger.info("Invalid operator ID")
            return
        dialogue_id = self.db.add_dialogue(user_id, datetime.now(), dialogue)
        logger.info("Dialogue added to the database")
        self.score_dialogue(dialogue, dialogue_id)
        self.match_dialogue(dialogue, dialogue_id, user_id)
        
    def score_dialogue(self, dialogue, dialogue_id):
        logger.info("Scoring dialogue...")
        prompt_scoring = self.analysis_template.format(dialogue)
        answer = self.model.get_answer(prompt_scoring)
        print(answer)

        try:
            answer_json = json.loads(answer)
            theme = answer_json['theme']
            criteria_arr = answer_json['criteria']
            result = answer_json['result']
            result_comment = answer_json['result_comment']
            recs = answer_json['recommendations']

            criteria = {}
            criteria['prof_score'], criteria['prof_com'] = criteria_arr[0]['score'], criteria_arr[0]['comments']
            criteria['reg_score'], criteria['reg_com'] = criteria_arr[1]['score'], criteria_arr[1]['comments']
            criteria['eff_score'], criteria['eff_com'] = criteria_arr[2]['score'], criteria_arr[2]['comments']
            criteria['res_score'], criteria['res_com'] = criteria_arr[3]['score'], criteria_arr[3]['comments']
            criteria['gram_score'], criteria['gram_com'] = criteria_arr[4]['score'], criteria_arr[4]['comments']
            criteria['emp_score'], criteria['emp_com'] = criteria_arr[5]['score'], criteria_arr[5]['comments']
        except:
            self.db.delete_dialogue(dialogue_id)
            logger.error("Dialogue scoring error")
            return False
        logger.info("Dialogue scoring generated")

        total_score = round((criteria['prof_score'] + criteria['reg_score'] + criteria['eff_score'] + 
                       criteria['res_score'] + criteria['gram_score'] + criteria['emp_score']) / 6, 2)
        self.db.add_scoring_analysis(dialogue_id, theme, criteria, total_score, result, result_comment, recs)
        logger.info("Dialogue scoring added to the database")
        return True

    def match_dialogue(self, dialogue, dialogue_id, oper_id):
        logger.info("Matching dialogue with script...")
        script_id, script = self.db.get_script(oper_id)

        prompt = self.script_template.format(script, dialogue)
        answer = self.model.get_answer(prompt)

        try:
            answer_json = json.loads(answer)
            theme = answer_json['theme']
            script_score = answer_json['script_score']
            script_comment = answer_json['script_comment']
            script_recommendations = answer_json['script_recommendations']
        except:
            self.db.delete_dialogue(dialogue_id)
            logger.error("Dialogue script matching error")
            return False
        logger.info("Dialogue script matching generated")

        self.db.add_script_analysis(dialogue_id, script_id, theme, script_score, script_comment, script_recommendations)
        logger.info("Dialogue script matching added to the database")
        return True


class EventHandler(FileSystemEventHandler):
    """ Отслеживает добавление новый файлов с диалогами и запускает анализ """    

    def __init__(self):
        self.eval = Evaluator()

    @staticmethod
    def work(event):
        # отслеживаем только текстовые файлы
        flag = False
        suffix = ('txt',)
        if not event.is_directory and event.src_path.endswith(suffix):
            flag = True
        return flag

    def on_created(self, event):
        # обрабатываем событие on_created
        if self.work(event):
            logger.info(f"Created on {event.src_path}")
            time.sleep(5)
            self.eval.process_dialogue(event.src_path)
            


if __name__ == "__main__":  
    handler = EventHandler()
    observer = Observer()

    path = os.getenv("DIALOGUES_DIR") # отслеживаемый путь
    observer.schedule(handler, path=path, recursive=True)
    observer.start()
    try:
        while observer.is_alive():
            observer.join(10)
    finally:
        observer.stop()
        observer.join()