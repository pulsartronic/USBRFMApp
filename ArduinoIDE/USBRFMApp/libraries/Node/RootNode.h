#include <Node.h>
#include <DataChannel.h>
#include <DS.h>

#ifndef __RootNode__
#define __RootNode__

class RootNode : public Node, public DataChannel::Handler {
	public:

	CDS::Iterator storageIterator;

	RootNode(Node* parent, const char* name);
	virtual ~RootNode();

	virtual void setup();
	virtual void loop();
	virtual void command(CDS::DataBuffer* command);
	virtual CDS::DataBuffer* rootIT(CDS::DataBuffer* root);
	virtual void onData(DataChannel* dataChannel, CDS::DataBuffer* data);
	virtual CDS::Iterator storage();
	
	void send(CDS::DataBuffer* command);
};

#endif

