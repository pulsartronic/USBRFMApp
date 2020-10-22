#include <Node.h>

void Node_state(Node* cdNode, CDS::DataBuffer* params, CDS::DataBuffer* response) {
	cdNode->state(params, response);
}

void Node_save(Node* cdNode, CDS::DataBuffer* params, CDS::DataBuffer* response) {
	cdNode->save(params, response);
}


Node::Node(Node* parent, const char* name) : parent(parent) {
	this->name = String(name);
	this->nodes = new KeyValueMap<Node>();
	this->methods = new KeyValueMap<Method>();

	Method* state = new Node::Method(this, Node_state);
	this->methods->set(S("state"), state);

	Method* save = new Node::Method(this, Node_save);
	this->methods->set(S("save"), save);
}

Node::~Node() {
	delete this->nodes;
	
	Method* state = this->methods->get(S("state"));
	delete state;
	
	Method* save = this->methods->get(S("save"));
	delete save;
	
	delete this->methods;
}

CDS::Iterator Node::storage() {
	return CDS::Object::taketo(this->parent->storage(), (const uint8_t*) this->name.c_str());
}

void Node::from(CDS::DataBuffer* params) {
	
}

void Node::to(CDS::DataBuffer* params) {

}

void Node::applySettings() {
	
}

void Node::save(CDS::DataBuffer* params, CDS::DataBuffer* response) {
	this->from(params);
	this->applySettings();
	yield();
	this->state(params, response);
}

void Node::oncommand(CDS::DataBuffer* params, CDS::DataBuffer* response) {
	size_t size = CDS::Element::size(params);
	for (size_t i = (size_t) 0; i < size; i++) {
		CDS::DataBuffer* key = CDS::Object::key(params, i);
		if (NULL != key) {
			if (NULL != key->next) {
				bool isObject = CDS::Element::isObject(key->next);
				if (isObject) {
					CDS::DataBuffer* iparams = key->next;
					Node* implementer = this->nodes->get(key);
					Method* method = this->methods->get(key);
					if (NULL != implementer) {
						implementer->oncommand(iparams, response);
					} else if (NULL != method) {
						method->call(iparams, response);
					}
				}
			}
		}
	}
}

void Node::command(CDS::DataBuffer* command) {
	this->parent->command(command);
}

CDS::DataBuffer* Node::rootIT(CDS::DataBuffer* root) {
	CDS::DataBuffer* parentObject = this->parent->rootIT(root);
	CDS::DataBuffer* createdObject = CDS::Object::get(parentObject, (const uint8_t*) this->name.c_str());
	if (NULL == createdObject) {
		createdObject = CDS::Object::newObject(parentObject, (const uint8_t*) this->name.c_str());
	}
	return createdObject;
}

void Node::state(CDS::DataBuffer* params, CDS::DataBuffer* response) {

}

void Node::log(String& text) {
	/*
	DynamicJsonDocument rootDocument(512);
	CDS::DataBuffer command = rootDocument.to<CDS::DataBuffer>();
	CDS::DataBuffer object = this->rootIT(command);
	CDS::DataBuffer log = object.createNestedObject("log");
	log["text"] = text;
	log["tstm"] = sntp_get_current_timestamp();
	this->command(command);
	*/
}
