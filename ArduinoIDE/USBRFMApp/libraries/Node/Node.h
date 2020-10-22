#include <Arduino.h>
#include <KeyValueMap.h>
#include <CDS.h>

#ifndef __Node__
#define __Node__

class Node {
	public:
	class Method {
		public:
		Node* cdNode = NULL;
		void (*method) (Node* cdNode, CDS::DataBuffer*, CDS::DataBuffer*);
		
		Method(Node* cdNode, void (*method) (Node* cdNode, CDS::DataBuffer*, CDS::DataBuffer*)) {
			this->cdNode = cdNode;
			this->method = method;
		}
		
		void call(CDS::DataBuffer* params, CDS::DataBuffer* response) {
			this->method(this->cdNode, params, response);
		}
	};

	Node* parent = NULL;
	String name;
	KeyValueMap<Node>* nodes = NULL;
	KeyValueMap<Node::Method>* methods = NULL;

	Node(Node* parent, const char* name);
	virtual ~Node();

	virtual void from(CDS::DataBuffer* params);
	virtual void to(CDS::DataBuffer* params); // DEPRECATED
	virtual void applySettings();
	virtual void save(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void oncommand(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void command(CDS::DataBuffer* command);
	virtual CDS::DataBuffer* rootIT(CDS::DataBuffer* root);
	virtual void state(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void log(String& text);
	
	virtual CDS::Iterator storage();
};

#endif

